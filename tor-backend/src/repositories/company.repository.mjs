import { getDatabase } from '../config/database.mjs';
import { toObjectId } from '../utils/object-id.mjs';
import { assertActiveTagIds } from './tag.repository.mjs';

function companies() {
  return getDatabase().collection('companies');
}

export async function createCompany({
  legalName,
  displayName = null,
  taxId = null,
  companySize = null,
  district = null,
  createdByUserId = null
}) {
  const now = new Date();
  const document = {
    legalName: legalName.trim(),
    displayName: (displayName || legalName).trim(),
    taxId: taxId ? taxId.trim() : null,
    companySize: companySize ?? null,
    district: district ?? null,
    verificationStatus: 'unverified',
    createdByUserId: createdByUserId ? toObjectId(createdByUserId, 'createdByUserId') : null,
    memberCount: 1,
    updatedAt: now,
    createdAt: now
  };

  const result = await companies().insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function setCompanyCreator(companyId, userId) {
  return companies().updateOne(
    { _id: toObjectId(companyId, 'companyId') },
    { $set: { createdByUserId: toObjectId(userId, 'userId'), updatedAt: new Date() } }
  );
}

export async function findCompanyById(companyId) {
  return companies().findOne({ _id: toObjectId(companyId, 'companyId') });
}

export async function findCompanyByTaxId(taxId) {
  return companies().findOne({ taxId });
}

export async function updateCompanyVerification(companyId, verificationStatus) {
  const allowedStatuses = ['unverified', 'pending', 'verified', 'rejected'];

  if (!allowedStatuses.includes(verificationStatus)) {
    const error = new Error('Company verification status is invalid.');
    error.status = 400;
    error.code = 'INVALID_COMPANY_STATUS';
    throw error;
  }

  return companies().findOneAndUpdate(
    { _id: toObjectId(companyId, 'companyId') },
    { $set: { verificationStatus, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
}

export async function replaceCompanyTagAssignments(companyId, assignments, reviewedByUserId) {
  const objectIds = await assertActiveTagIds(assignments.map(({ tagId }) => tagId));
  const now = new Date();
  const tagAssignments = assignments.map((assignment, index) => ({
    tagId: objectIds[index],
    source: 'manual',
    confidence: 1,
    verificationLevel: assignment.verificationLevel,
    reviewStatus: 'approved',
    evidence: assignment.evidence,
    reviewedByUserId: toObjectId(reviewedByUserId, 'reviewedByUserId'),
    reviewedAt: now,
    assignedAt: now
  }));

  return companies().findOneAndUpdate(
    { _id: toObjectId(companyId, 'companyId') },
    { $set: { tagAssignments, updatedAt: now } },
    { returnDocument: 'after' }
  );
}

