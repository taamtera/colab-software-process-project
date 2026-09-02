import { getDatabase } from '../config/database.mjs';
import { toObjectId } from '../utils/object-id.mjs';

function auditLogs() {
  return getDatabase().collection('audit_logs');
}

export async function recordAuditEvent({
  actorUserId = null,
  event,
  outcome,
  targetType,
  targetId = null,
  requestId = null,
  userAgent = null,
  ipAddressHash = null,
  metadata = {}
}) {
  const document = {
    actorUserId: actorUserId ? toObjectId(actorUserId, 'actorUserId') : null,
    event,
    outcome,
    targetType,
    targetId: targetId ? toObjectId(targetId, 'targetId') : null,
    requestId,
    userAgent,
    ipAddressHash,
    metadata,
    createdAt: new Date()
  };

  const result = await auditLogs().insertOne(document);
  return { ...document, _id: result.insertedId };
}

