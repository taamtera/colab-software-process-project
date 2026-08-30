import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnvironment() {
  const envPath = resolve(process.cwd(), '.env');

  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

    for (const line of lines) {
      const value = line.trim();

      if (!value || value.startsWith('#')) {
        continue;
      }

      const separator = value.indexOf('=');

      if (separator === -1) {
        continue;
      }

      const key = value.slice(0, separator).trim();
      const rawValue = value.slice(separator + 1).trim();

      if (!process.env[key]) {
        process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB_NAME || 'tor_software';

  if (!uri || uri.includes('<database_user>')) {
    throw new Error('Set a valid MONGODB_URI in database-design/.env before running this command.');
  }

  return { uri, databaseName };
}

