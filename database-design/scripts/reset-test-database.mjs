import { spawnSync } from 'node:child_process';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { assertTestDatabase } from './database-safety.mjs';
import { loadEnvironment } from './env.mjs';

const { uri } = loadEnvironment();
const testDatabaseName = process.env.MONGODB_TEST_DB_NAME?.trim() || 'tor_software_test';
assertTestDatabase(testDatabaseName);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true
  }
});

try {
  await client.connect();
  await client.db(testDatabaseName).dropDatabase();
  console.log(`Dropped test database: ${testDatabaseName}`);
} finally {
  await client.close();
}

const childEnvironment = {
  ...process.env,
  MONGODB_URI: uri,
  MONGODB_DB_NAME: testDatabaseName
};

for (const script of ['scripts/setup-database.mjs', 'scripts/seed-demo.mjs', 'scripts/verify-database.mjs']) {
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: childEnvironment,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log(`Test database reset complete: ${testDatabaseName}`);

