import { createServer } from 'node:http';
import { getDatabase } from './database.mjs';
import { env } from './env.mjs';

export function startHealthServer(getWorkerState) {
  const server = createServer(async (request, response) => {
    if (request.url !== '/health') {
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'not_found' }));
      return;
    }

    try {
      await getDatabase().command({ ping: 1 });
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({
        status: 'ok',
        database: 'connected',
        environment: env.crawlerEnvironment,
        enabled: env.crawlerEnabled,
        worker: getWorkerState()
      }));
    } catch {
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: 'unavailable', database: 'disconnected' }));
    }
  });

  server.listen(env.healthPort, '0.0.0.0', () => {
    console.log(`Crawler health endpoint listening on port ${env.healthPort}`);
  });

  return server;
}

