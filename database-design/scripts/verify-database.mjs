import { MongoClient, ServerApiVersion } from 'mongodb';
import { loadEnvironment } from './env.mjs';

const { uri, databaseName } = loadEnvironment();
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

const requiredCollections = [
  'sources',
  'organizations',
  'procurement_projects',
  'tor_announcements',
  'tor_versions',
  'ingestion_runs',
  'raw_ingestion_items',
  'rss_query_state',
  'users',
  'auth_tokens',
  'sessions',
  'audit_logs',
  'companies',
  'ai_evaluations',
  'company_matches',
  'saved_tors',
  'notifications'
];

const expectedRequiredFields = {
  sources: ['rawRetentionDays'],
  organizations: ['ancestorIds'],
  procurement_projects: ['externalProjectId', 'organizationId'],
  tor_announcements: ['departmentId', 'projectId', 'templateId', 'title', 'description', 'publishedAt', 'url', 'procurementMethod', 'announcementType', 'channelParams', 'itemParams', 'firstSeenAt', 'lastSeenAt'],
  ingestion_runs: ['sourceId', 'fetchedAt', 'request', 'reportedCount', 'itemsReceived', 'complete'],
  rss_query_state: ['queryKey', 'reportedCount', 'itemsReceived', 'complete', 'splitLevel', 'status', 'retryCount', 'lastCheckedAt'],
  users: ['notificationPreferences'],
  ai_evaluations: ['retryCount', 'lastAttemptAt', 'nextAttemptAt', 'lastError'],
  notifications: ['attemptCount', 'nextAttemptAt', 'deliveryError']
};

const expectedNestedRequiredFields = {
  tor_announcements: {},
  users: {
    notificationPreferences: ['channels', 'alertTypes']
  },
  ai_evaluations: {
    lastError: ['code', 'message', 'retryable']
  },
  notifications: {
    deliveryError: ['code', 'message', 'lastAttemptAt']
  }
};

const expectedIndexes = {
  organizations: ['ix_organizations_ancestors'],
  procurement_projects: ['uq_projects_source_external'],
  tor_announcements: ['uq_rss_tors_source_url', 'tx_rss_tors_discovery'],
  ingestion_runs: ['ix_rss_ingestion_source_fetched'],
  raw_ingestion_items: ['ttl_raw_ingestion_expiry'],
  rss_query_state: ['uq_rss_query_source_key', 'ix_rss_query_retry_queue'],
  audit_logs: ['ttl_audit_expiry'],
  ai_evaluations: ['uq_ai_tor_version', 'ix_ai_queue_ready'],
  company_matches: ['uq_matches_company_tor_version'],
  saved_tors: ['uq_saved_user_tor'],
  notifications: ['ix_notifications_delivery_queue']
};

try {
  await client.connect();
  const database = client.db(databaseName);
  const existingCollections = new Set(
    (await database.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name)
  );
  const missingCollections = requiredCollections.filter((name) => !existingCollections.has(name));

  if (missingCollections.length > 0) {
    throw new Error(`Missing collections: ${missingCollections.join(', ')}`);
  }

  for (const collectionName of requiredCollections) {
    const collection = database.collection(collectionName);
    const documentCount = await collection.countDocuments({});
    const collectionInfo = await database.listCollections({ name: collectionName }).next();
    const jsonSchema = collectionInfo?.options?.validator?.$jsonSchema;
    const requiredFields = new Set(jsonSchema?.required || []);
    const indexes = await collection.listIndexes().toArray();
    const indexCount = indexes.length;

    for (const fieldName of expectedRequiredFields[collectionName] || []) {
      if (!requiredFields.has(fieldName)) {
        throw new Error(`Missing required validator field: ${collectionName}.${fieldName}`);
      }
    }

    for (const [objectName, nestedFields] of Object.entries(expectedNestedRequiredFields[collectionName] || {})) {
      const nestedRequired = new Set(jsonSchema?.properties?.[objectName]?.required || []);
      for (const fieldName of nestedFields) {
        if (!nestedRequired.has(fieldName)) {
          throw new Error(`Missing nested validator field: ${collectionName}.${objectName}.${fieldName}`);
        }
      }
    }

    for (const indexName of expectedIndexes[collectionName] || []) {
      const index = indexes.find(({ name }) => name === indexName);
      if (!index) {
        throw new Error(`Missing index: ${collectionName}.${indexName}`);
      }
      if (indexName.startsWith('uq_') && index.unique !== true) {
        throw new Error(`Index must be unique: ${collectionName}.${indexName}`);
      }
      if (indexName.startsWith('ttl_') && index.expireAfterSeconds !== 0) {
        throw new Error(`Index must expire at the document date: ${collectionName}.${indexName}`);
      }
    }

    console.log(`${collectionName}: ${documentCount} document(s), ${indexCount} index(es)`);
  }

  console.log(`Database verification passed: ${databaseName}`);
} finally {
  await client.close();
}
