import { closeDatabase, connectDatabase } from './database.mjs';
import { runCrawlerCycle } from './crawler-cycle.mjs';
import { env } from './env.mjs';
import { startHealthServer } from './health-server.mjs';

let workerState = {
  status: 'starting',
  lastCycleAt: null,
  lastResult: null
};
let cycleRunning = false;

await connectDatabase();

async function executeCycle() {
  if (cycleRunning) {
    return;
  }

  cycleRunning = true;
  workerState = { ...workerState, status: 'running' };

  try {
    const result = await runCrawlerCycle();
    workerState = {
      status: result.status,
      lastCycleAt: new Date().toISOString(),
      lastResult: result
    };
  } catch (error) {
    workerState = {
      status: 'failed',
      lastCycleAt: new Date().toISOString(),
      lastResult: { message: error.message }
    };
    console.error('Crawler cycle failed.', error);
  } finally {
    cycleRunning = false;
  }
}

const healthServer = startHealthServer(() => workerState);
await executeCycle();
const timer = setInterval(executeCycle, env.pollIntervalSeconds * 1000);

console.log(`Crawler worker started in ${env.crawlerEnvironment} mode. Enabled: ${env.crawlerEnabled}`);

async function shutdown(signal) {
  console.log(`${signal} received. Closing the crawler safely.`);
  clearInterval(timer);
  healthServer.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

