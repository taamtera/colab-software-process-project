import { MongoClient, ServerApiVersion } from 'mongodb';
import { assertNonProductionDatabase } from './database-safety.mjs';
import { loadEnvironment } from './env.mjs';

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
  const result = await client.db(databaseName).collection('raw_ingestion_items').deleteMany({
    expiresAt: { $lte: new Date() }
  });
  console.log(`Removed ${result.deletedCount} expired raw ingestion item(s) from ${databaseName}.`);
} finally {
  await client.close();
}

