import { MongoClient, ServerApiVersion } from 'mongodb';
import { loadEnvironment } from './env.mjs';

const { uri, databaseName } = loadEnvironment();
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

try {
  await client.connect();
  await client.db(databaseName).command({ ping: 1 });
  console.log(`Connected successfully to MongoDB Atlas database: ${databaseName}`);
} finally {
  await client.close();
}

