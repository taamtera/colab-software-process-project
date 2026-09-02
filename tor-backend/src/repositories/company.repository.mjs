import { getDatabase } from '../config/database.mjs';
import { toObjectId } from '../utils/object-id.mjs';

function companies() {
  return getDatabase().collection('companies');
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

