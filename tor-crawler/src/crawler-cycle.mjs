import { sourceAdapters } from './adapters/index.mjs';
import { env } from './env.mjs';

export async function runCrawlerCycle() {
  if (!env.crawlerEnabled) {
    return {
      status: 'disabled',
      adapterCount: sourceAdapters.length,
      completedAt: new Date()
    };
  }

  if (sourceAdapters.length === 0) {
    return {
      status: 'waiting_for_adapters',
      adapterCount: 0,
      completedAt: new Date()
    };
  }

  const results = [];

  for (const adapter of sourceAdapters) {
    results.push(await adapter.collect({
      environment: env.crawlerEnvironment,
      rawRetentionDays: env.rawRetentionDays
    }));
  }

  return {
    status: 'completed',
    adapterCount: sourceAdapters.length,
    results,
    completedAt: new Date()
  };
}

