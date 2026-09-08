import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDirectory = path.resolve(import.meta.dirname, '..');
const requiredFiles = [
  '.env.example',
  '.gitignore',
  'README.md',
  'package.json',
  'package-lock.json',
  'docs/schema.md',
  'docs/team-handoff.md',
  'scripts/check-connection.mjs',
  'scripts/setup-database.mjs',
  'scripts/verify-database.mjs',
];

const errors = [];

for (const relativePath of requiredFiles) {
  try {
    const file = await stat(path.join(rootDirectory, relativePath));
    if (!file.isFile()) {
      errors.push(`${relativePath} is not a file.`);
    }
  } catch {
    errors.push(`${relativePath} is missing.`);
  }
}

const gitignore = await readFile(path.join(rootDirectory, '.gitignore'), 'utf8');
for (const ignoredPath of ['.env', 'node_modules/']) {
  if (!gitignore.split(/\r?\n/u).includes(ignoredPath)) {
    errors.push(`.gitignore must include ${ignoredPath}.`);
  }
}

const environmentExample = await readFile(path.join(rootDirectory, '.env.example'), 'utf8');
const requiredEnvironmentNames = ['MONGODB_URI', 'MONGODB_DB_NAME'];

for (const environmentName of requiredEnvironmentNames) {
  if (!new RegExp(`^${environmentName}=`, 'mu').test(environmentExample)) {
    errors.push(`.env.example is missing ${environmentName}.`);
  }
}

const uriLine = environmentExample.match(/^MONGODB_URI=(.+)$/mu)?.[1] ?? '';
if (!uriLine.includes('<database_user>') || !uriLine.includes('<database_password>')) {
  errors.push('.env.example must use placeholder Atlas credentials.');
}

if (errors.length > 0) {
  console.error('Handoff verification failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('Handoff verification passed.');
  console.log(`Checked ${requiredFiles.length} required files and safe environment placeholders.`);
}
