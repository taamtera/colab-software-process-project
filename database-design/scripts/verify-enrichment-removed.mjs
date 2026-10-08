import { MongoClient } from 'mongodb';
import { loadEnvironment } from './env.mjs';
import { REMOVED_ENRICHMENT_FIELDS } from './ingestion-schema.mjs';

const { uri, databaseName } = loadEnvironment();
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const projects = client.db(databaseName).collection('tor_announcements');
  const [totalProjects, projectsWithRemovedFields, counts] = await Promise.all([
    projects.countDocuments({}),
    projects.countDocuments({ $or: REMOVED_ENRICHMENT_FIELDS.map(field => ({ [field]: { $exists: true } })) }),
    Promise.all(REMOVED_ENRICHMENT_FIELDS.map(async field => [field, await projects.countDocuments({ [field]: { $exists: true } })]))
  ]);
  console.log(JSON.stringify({ database: databaseName, totalProjects, projectsWithRemovedFields, remainingByField: Object.fromEntries(counts) }, null, 2));
  if (projectsWithRemovedFields) process.exitCode = 1;
} catch (error) {
  console.error(`Verification unavailable (${error.name}${error.code ? `, ${error.code}` : ''}).`);
  process.exitCode = 1;
} finally { await client.close(); }
