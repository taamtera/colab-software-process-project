import { readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

function listModules(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listModules(path) : [path];
  });
}

const modules = listModules('src').filter((path) => extname(path) === '.mjs');

for (const modulePath of modules) {
  const result = spawnSync(process.execPath, ['--check', modulePath], { encoding: 'utf8' });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}

console.log(`Syntax check passed for ${modules.length} crawler modules.`);

