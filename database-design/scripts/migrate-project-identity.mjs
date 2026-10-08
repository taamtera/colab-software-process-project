import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MongoClient, BSON } from 'mongodb';
import { loadEnvironment } from './env.mjs';
import { planProjectMigration } from './project-migration.mjs';
import { ingestionIndexes, retiredIdentityIndexes } from './ingestion-schema.mjs';

const apply = process.argv.includes('--apply');
const backupIndex = process.argv.indexOf('--backup');
const backupPath = backupIndex >= 0 ? process.argv[backupIndex + 1] : null;
if (apply && (!backupPath || backupPath.startsWith('--'))) throw new Error('--apply requires --backup <new-file.ejson>');
const { uri, databaseName } = loadEnvironment();
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

try {
  await client.connect();
  const database = client.db(databaseName);
  const names = ['tor_announcements', 'thumbnails', 'ingestion_runs'];
  const snapshot = {};
  for (const name of names) {
    const exists = await database.listCollections({ name }).next();
    snapshot[name] = {
      documents: exists ? await database.collection(name).find({}).toArray() : [],
      options: exists?.options ?? {},
      indexes: exists ? await database.collection(name).listIndexes().toArray() : []
    };
  }
  const plan = planProjectMigration(snapshot.tor_announcements.documents, snapshot.thumbnails.documents);
  // Collapsing duplicate announcements must not orphan saved TORs or versioned application data.
  const dependentCollections = ['tor_versions', 'ai_evaluations', 'company_matches', 'saved_tors', 'notifications'];
  if (plan.removedAnnouncementIds.length) {
    for (const name of dependentCollections) {
      const count = await database.collection(name).countDocuments({ torId: { $in: plan.removedAnnouncementIds } });
      if (count) plan.errors.push(`${name}: ${count} references to duplicate _ids require reconciliation before applying`);
    }
  }
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'preview', database: databaseName,
    inputProjects: snapshot.tor_announcements.documents.length, outputProjects: plan.projects.length,
    inputThumbnails: snapshot.thumbnails.documents.length, outputThumbnails: plan.images.length,
    duplicateAnnouncements: plan.removedAnnouncementIds.length, discardedThumbnails: plan.removedThumbnailIds.length,
    ambiguousProjects: plan.projects.filter(project => project.statusOrderAmbiguous).length,
    errors: plan.errors
  }, null, 2));
  if (plan.errors.length) throw new Error('Migration blocked by unresolved source identities or application references. No data was changed.');
  if (!apply) {
    console.log('Preview only. Pause ingestion, then use --apply --backup <new-file.ejson> to migrate and create unique projectId indexes.');
  } else {
    // Check transaction support before changing data or indexes. Atlas supports transactions.
    const topology = await database.command({ hello: 1 });
    if (!topology.setName && topology.msg !== 'isdbgrid') throw new Error('Migration requires a replica set or mongos for an atomic transaction.');
    await writeFile(resolve(backupPath), BSON.EJSON.stringify({ database: databaseName, backedUpAt: new Date(), collections: snapshot }, { relaxed: false }), { flag: 'wx', mode: 0o600 });
    for (const name of ['tor_announcements', 'thumbnails']) {
      if (!(await database.listCollections({ name }, { nameOnly: true }).hasNext())) await database.createCollection(name);
      const indexNames = new Set((await database.collection(name).listIndexes().toArray()).map(index => index.name));
      for (const indexName of retiredIdentityIndexes[name]) {
        if (indexNames.has(indexName)) await database.collection(name).dropIndex(indexName);
      }
    }
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // Ingestion must be paused. Abort if the source changed after the preview/backup.
        for (const name of ['tor_announcements', 'thumbnails']) {
          const current = await database.collection(name).find({}, { session }).toArray();
          const canonical = documents => BSON.EJSON.stringify([...documents].sort((a, b) => String(a._id).localeCompare(String(b._id))), { relaxed: false });
          if (canonical(current) !== canonical(snapshot[name].documents)) throw new Error(`${name} changed during migration. Pause ingestion and rerun with a new backup file.`);
        }
        for (const [name, documents, removed] of [
          ['tor_announcements', plan.projects, plan.removedAnnouncementIds],
          ['thumbnails', plan.images, plan.removedThumbnailIds]
        ]) {
          const collection = database.collection(name);
          if (removed.length) await collection.deleteMany({ _id: { $in: removed } }, { session });
          if (documents.length) await collection.bulkWrite(documents.map(document => ({ replaceOne: { filter: { _id: document._id }, replacement: document } })), { session, bypassDocumentValidation: true });
        }
      });
    } finally { await session.endSession(); }
    // The workflow does not create indexes; the migration explicitly does so after merging.
    for (const name of ['tor_announcements', 'thumbnails']) {
      const [keys, options] = ingestionIndexes[name][0];
      await database.collection(name).createIndex(keys, options);
    }
    console.log('Migration complete; projectId is unique in both collections. Run db:setup then db:verify. Original documents, validators and indexes are in the EJSON backup.');
  }
} finally { await client.close(); }
