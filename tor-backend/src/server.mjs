import { app } from './app.mjs';
import { closeDatabase, connectDatabase } from './config/database.mjs';
import { env } from './config/env.mjs';

await connectDatabase();

const server = app.listen(env.port, () => {
  console.log(`TOR Software API listening on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing the API safely.`);
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

