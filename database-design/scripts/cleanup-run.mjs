import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { assertNonProductionDatabase } from './database-safety.mjs';
import { loadEnvironment } from './env.mjs';

const runId = process.argv[2];

if (!runId || !ObjectId.isValid(runId)) {
  throw new Error('Provide a valid ingestion run ID: npm run db:cleanup:run -- <runId>');
}

const { uri, databaseName } = loadEnvironment();
assertNonProductionDatabase(databaseName);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

try {
  await client.connect();
  const database = client.db(databaseName);
  const ingestionRunId = new ObjectId(runId);
  const rawResult = await database.collection('raw_ingestion_items').deleteMany({ ingestionRunId });
  const runResult = await database.collection('ingestion_runs').deleteOne({ _id: ingestionRunId });
  console.log(`Removed run ${runId}: ${rawResult.deletedCount} raw item(s), ${runResult.deletedCount} run record(s).`);
} finally {
  await client.close();
}

