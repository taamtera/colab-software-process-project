export function assertNonProductionDatabase(databaseName) {
  const normalized = databaseName.trim().toLowerCase();
  const isKnownDevelopmentDatabase = normalized === 'tor_software';
  const isExplicitlyNonProduction = normalized.endsWith('_dev') || normalized.endsWith('_test');
  const looksLikeProduction = normalized.endsWith('_prod') || normalized.includes('production');

  if (looksLikeProduction || (!isKnownDevelopmentDatabase && !isExplicitlyNonProduction)) {
    throw new Error(`Cleanup is blocked for database: ${databaseName}`);
  }
}

export function assertTestDatabase(databaseName) {
  if (!databaseName.trim().toLowerCase().endsWith('_test')) {
    throw new Error(`Reset is allowed only for databases ending in _test: ${databaseName}`);
  }
}

