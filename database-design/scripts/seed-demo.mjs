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

const now = new Date();

async function upsertAndGetId(collection, filter, document) {
  const result = await collection.findOneAndUpdate(
    filter,
    {
      $set: { ...document, updatedAt: now },
      $setOnInsert: { createdAt: now }
    },
    { upsert: true, returnDocument: 'after', includeResultMetadata: false }
  );

  return result._id;
}

try {
  await client.connect();
  const database = client.db(databaseName);
  await database.command({ ping: 1 });

  const sourceSamples = [
    { code: 'EGP', name: 'Thai Government Procurement', baseUrl: 'https://www.gprocurement.go.th', adapterType: 'egp-feed', enabled: true },
    { code: 'BMA', name: 'Bangkok Metropolitan Administration', baseUrl: 'https://www.bangkok.go.th', adapterType: 'bma-procurement', enabled: true },
    { code: 'DGA', name: 'Digital Government Development Agency', baseUrl: 'https://www.dga.or.th', adapterType: 'dga-procurement', enabled: true },
    { code: 'ETDA', name: 'Electronic Transactions Development Agency', baseUrl: 'https://www.etda.or.th', adapterType: 'etda-procurement', enabled: true },
    { code: 'DEPA', name: 'Digital Economy Promotion Agency', baseUrl: 'https://www.depa.or.th', adapterType: 'depa-procurement', enabled: true },
    { code: 'NSTDA', name: 'National Science and Technology Development Agency', baseUrl: 'https://www.nstda.or.th', adapterType: 'nstda-procurement', enabled: true }
  ];

  const sourceIds = {};

  for (const source of sourceSamples) {
    sourceIds[source.code] = await upsertAndGetId(database.collection('sources'), { code: source.code }, {
      ...source,
      rawRetentionDays: 14,
      crawlSchedule: { frequency: 'daily', timezone: 'Asia/Bangkok' },
      lastSuccessfulRunAt: null
    });
  }

  const organizationId = await upsertAndGetId(
    database.collection('organizations'),
    { sourceId: sourceIds.BMA, externalId: 'BMA-MEDICAL-SERVICE' },
    {
      sourceId: sourceIds.BMA,
      externalId: 'BMA-MEDICAL-SERVICE',
      nameTh: 'สำนักการแพทย์ กรุงเทพมหานคร',
      nameEn: 'Medical Service Department, Bangkok Metropolitan Administration',
      organizationType: 'department',
      parentOrganizationId: null,
      ancestorIds: []
    }
  );

  const companyId = await upsertAndGetId(
    database.collection('companies'),
    { taxId: 'DEMO-0105566123456' },
    {
      legalName: 'TechBangkok Solutions Co., Ltd.',
      displayName: 'TechBangkok Solutions',
      taxId: 'DEMO-0105566123456',
      companySize: '25-50 Employees',
      district: 'Chatuchak',
      contact: { email: 'contact@example.com', phone: null, website: null },
      technologies: ['Next.js', 'React', 'TypeScript', 'Node.js', 'MongoDB', 'Docker', 'Google Cloud'],
      qualifications: [
        { code: 'ISO-27001', name: 'ISO 27001 Information Security Certified', category: 'certification', verified: true, evidenceUrl: null },
        { code: 'ISO-29110', name: 'ISO 29110 Software Process Certified', category: 'certification', verified: true, evidenceUrl: null },
        { code: 'MICROSERVICES', name: 'Node.js and Microservices Architecture', category: 'capability', verified: true, evidenceUrl: null },
        { code: 'GCP-AWS', name: 'Cloud Native Infrastructure', category: 'capability', verified: true, evidenceUrl: null }
      ],
      ownerUserId: null,
      memberUserIds: [],
      profileCompleteness: 92,
      verificationStatus: 'verified'
    }
  );

  const userId = await upsertAndGetId(
    database.collection('users'),
    { email: 'somchai@example.com' },
    {
      email: 'somchai@example.com',
      emailNormalized: 'somchai@example.com',
      displayName: 'Somchai Jaidee',
      passwordHash: '$2b$12$DEMO_ONLY_REPLACE_WITH_A_REAL_BCRYPT_HASH',
      profile: {
        firstName: 'Somchai',
        lastName: 'Jaidee',
        phone: null,
        avatarUrl: null,
        jobTitle: 'Company Administrator'
      },
      role: 'company_admin',
      companyId,
      notificationPreferences: {
        channels: ['in_app', 'email'],
        alertTypes: ['new_match', 'tor_updated', 'deadline_reminder'],
        deadlineReminderDays: 7
      },
      status: 'active',
      registrationSource: 'self',
      emailVerifiedAt: now,
      lastLoginAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: now,
      termsAcceptedAt: now,
      deletedAt: null
    }
  );

  await database.collection('audit_logs').updateOne(
    { actorUserId: userId, event: 'user.registration', 'metadata.demoSeed': true },
    {
      $setOnInsert: {
        actorUserId: userId,
        event: 'user.registration',
        outcome: 'success',
        targetType: 'user',
        targetId: userId,
        requestId: null,
        userAgent: null,
        ipAddressHash: null,
        metadata: { demoSeed: true, registrationSource: 'self' },
        createdAt: now
      }
    },
    { upsert: true }
  );

  await database.collection('companies').updateOne(
    { _id: companyId },
    { $set: { ownerUserId: userId, memberUserIds: [userId], updatedAt: now } }
  );

  const procurementProjectId = await upsertAndGetId(
    database.collection('procurement_projects'),
    { sourceId: sourceIds.BMA, externalProjectId: 'BMA-DHR-2026-001' },
    {
      sourceId: sourceIds.BMA,
      externalProjectId: 'BMA-DHR-2026-001',
      organizationId,
      title: 'Bangkok Digital Health Record',
      summary: 'โครงการพัฒนาระบบข้อมูลสุขภาพและการเชื่อมต่อบริการของกรุงเทพมหานคร',
      metadata: { demoSeed: true }
    }
  );

  const torId = await upsertAndGetId(
    database.collection('tor_announcements'),
    { sourceId: sourceIds.BMA, announcementKey: 'BMA|BMA-DHR-2026-001|TOR|2026|1|1' },
    {
      sourceId: sourceIds.BMA,
      procurementProjectId,
      announcementKey: 'BMA|BMA-DHR-2026-001|TOR|2026|1|1',
      externalProjectId: 'BMA-DHR-2026-001',
      templateType: 'TOR',
      tempAnnoun: '2026',
      tempItemNo: '1',
      seqNo: '1',
      title: 'โครงการพัฒนาระบบฐานข้อมูลบริการสุขภาพกรุงเทพฯ (Bangkok Digital Health Record)',
      summary: 'โครงการพัฒนาระบบข้อมูลสุขภาพและการเชื่อมต่อบริการของกรุงเทพมหานคร',
      category: 'Web & Mobile',
      keywords: ['health', 'EHR', 'big data', 'microservices', 'PDPA'],
      organization: {
        organizationId,
        externalId: 'BMA-MEDICAL-SERVICE',
        nameTh: 'สำนักการแพทย์ กรุงเทพมหานคร',
        nameEn: 'Medical Service Department, BMA',
        organizationType: 'department',
        ancestorIds: [],
        purchasingUnitName: null
      },
      announcementType: { code: 'TOR', nameTh: 'ร่างขอบเขตของงาน', nameEn: 'Terms of Reference' },
      procurementMethod: { code: 'E-BIDDING', nameTh: 'ประกวดราคาอิเล็กทรอนิกส์', nameEn: 'Electronic Bidding' },
      budget: { minAmount: 12000000, maxAmount: 12999999, currency: 'THB', sourceText: '12,5XX,XXX THB' },
      publishedAt: new Date('2026-05-01T02:00:00.000Z'),
      submissionDeadline: new Date('2026-06-05T09:00:00.000Z'),
      projectStartAt: new Date('2026-07-01T00:00:00.000Z'),
      projectEndAt: new Date('2027-05-31T00:00:00.000Z'),
      sourceUrl: 'https://www.bangkok.go.th',
      documents: [
        {
          documentId: 'BMA-DHR-TOR-PDF',
          name: 'TOR Bangkok Digital Health Record.pdf',
          sourceUrl: 'https://www.bangkok.go.th',
          storageUrl: null,
          mimeType: 'application/pdf',
          checksum: 'demo-sha256-replace-after-download',
          pageCount: 28,
          fileSizeBytes: null
        }
      ],
      status: 'open',
      version: 1,
      contentHash: 'demo-content-hash-v1',
      firstSeenAt: now,
      lastSeenAt: now
    }
  );

  await database.collection('tor_versions').updateOne(
    { torId, version: 1 },
    {
      $setOnInsert: {
        torId,
        version: 1,
        contentHash: 'demo-content-hash-v1',
        changeType: 'created',
        changedFields: [],
        snapshot: {
          title: 'โครงการพัฒนาระบบฐานข้อมูลบริการสุขภาพกรุงเทพฯ (Bangkok Digital Health Record)',
          status: 'open',
          submissionDeadline: new Date('2026-06-05T09:00:00.000Z'),
          budget: { minAmount: 12000000, maxAmount: 12999999, currency: 'THB' }
        },
        rawItem: null,
        capturedAt: now
      }
    },
    { upsert: true }
  );

  await database.collection('ai_evaluations').updateOne(
    { torId, torVersion: 1 },
    {
      $set: {
        status: 'completed',
        retryCount: 0,
        lastAttemptAt: now,
        nextAttemptAt: null,
        lastError: null,
        requirements: [
          { key: 'BIG_DATA_EHR', text: 'Experience developing large-scale data management or EHR systems', category: 'experience', importance: 'required', evidence: { page: 8, excerpt: 'Demo evidence text' } },
          { key: 'ISO_27001', text: 'ISO 27001 information security certification', category: 'certification', importance: 'required', evidence: { page: 11, excerpt: 'Demo evidence text' } },
          { key: 'MICROSERVICES', text: 'Microservices architecture with Docker or Kubernetes', category: 'technology', importance: 'required', evidence: { page: 14, excerpt: 'Demo evidence text' } }
        ],
        budgetObservation: { confidence: 0.84, note: 'Budget is consistent with a medium-to-large government health platform.' },
        riskFlags: [{ code: 'SHORT_BIDDING_WINDOW', severity: 'medium', message: 'The bidding preparation window may require immediate action.' }],
        summary: 'Strong fit for software houses with health-data, security, and cloud-native delivery experience.',
        model: { provider: 'Google Vertex AI', name: 'configured-project-model', version: 'demo', promptVersion: 'tor-evaluation-v1' },
        generatedAt: now,
        updatedAt: now
      },
      $setOnInsert: { torId, torVersion: 1, createdAt: now }
    },
    { upsert: true }
  );

  await database.collection('company_matches').updateOne(
    { companyId, torId, torVersion: 1 },
    {
      $set: {
        score: 98,
        recommendation: 'strong_match',
        requirementMatches: [
          { requirementKey: 'BIG_DATA_EHR', status: 'partial', evidence: ['Enterprise data platform experience'] },
          { requirementKey: 'ISO_27001', status: 'met', evidence: ['ISO 27001 qualification'] },
          { requirementKey: 'MICROSERVICES', status: 'met', evidence: ['Node.js and microservices capability'] }
        ],
        strengths: ['ISO 27001 certified', 'Cloud-native architecture', 'Strong matching technology stack'],
        gaps: ['Add explicit EHR project evidence before bidding'],
        explanation: 'The company meets the security and architecture requirements and has a highly compatible technology profile.',
        computedAt: now,
        updatedAt: now
      },
      $setOnInsert: { companyId, torId, torVersion: 1, createdAt: now }
    },
    { upsert: true }
  );

  await database.collection('saved_tors').updateOne(
    { userId, torId },
    {
      $set: { note: 'Review EHR portfolio evidence with the team.', followUpStatus: 'reviewing', updatedAt: now },
      $setOnInsert: { userId, torId, createdAt: now }
    },
    { upsert: true }
  );

  await database.collection('notifications').updateOne(
    { eventKey: `new-match:${companyId}:${torId}:1:in-app` },
    {
      $set: {
        status: 'queued',
        attemptCount: 0,
        nextAttemptAt: now,
        deliveryError: null,
        title: 'New 98% TOR match',
        message: 'Bangkok Digital Health Record strongly matches your company profile.',
        sentAt: null,
        readAt: null
      },
      $setOnInsert: {
        eventKey: `new-match:${companyId}:${torId}:1:in-app`,
        userId,
        companyId,
        torId,
        type: 'new_match',
        channel: 'in_app',
        createdAt: now
      }
    },
    { upsert: true }
  );

  console.log(`Demo data is ready in MongoDB Atlas database: ${databaseName}`);
} finally {
  await client.close();
}
