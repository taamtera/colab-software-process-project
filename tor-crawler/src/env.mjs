import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function required(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function integer(name, fallback, minimum, maximum) {
  const value = Number.parseInt(process.env[name]?.trim() || String(fallback), 10);

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
  }

  return value;
}

export const env = Object.freeze({
  mongodbUri: required('MONGODB_URI'),
  mongodbDatabaseName: process.env.MONGODB_DB_NAME?.trim() || 'tor_software',
  crawlerEnvironment: process.env.CRAWLER_ENVIRONMENT?.trim() || 'development',
  crawlerEnabled: process.env.CRAWLER_ENABLED?.trim().toLowerCase() === 'true',
  pollIntervalSeconds: integer('CRAWLER_POLL_INTERVAL_SECONDS', 300, 30, 86400),
  healthPort: integer('CRAWLER_HEALTH_PORT', 4100, 1, 65535),
  rawRetentionDays: integer('RAW_RETENTION_DAYS', 14, 1, 90)
});

if (!['development', 'test', 'production'].includes(env.crawlerEnvironment)) {
  throw new Error('CRAWLER_ENVIRONMENT must be development, test, or production.');
}
