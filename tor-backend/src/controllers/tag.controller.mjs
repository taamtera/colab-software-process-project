import { findCompanyById, replaceCompanyTagAssignments } from '../repositories/company.repository.mjs';
import { createControlledTag, listControlledTags } from '../repositories/tag.repository.mjs';
import { replaceTorTagAssignments } from '../repositories/tor.repository.mjs';
import { httpError } from '../utils/http-error.mjs';
import { TAG_CATEGORIES, validateCompanyTagAssignments, validateCreateTag, validateTorTagAssignments } from '../validators/tag.validators.mjs';

export async function list(request, response) {
  const category = request.query.category || null;
  if (category && !TAG_CATEGORIES.includes(category)) {
    throw httpError(400, 'INVALID_TAG_CATEGORY', 'The tag category is invalid.');
  }

  const items = await listControlledTags({ category, search: request.query.search || null });
  response.json({ items });
}

export async function create(request, response) {
  const input = validateCreateTag(request.body);
  const tag = await createControlledTag({ ...input, createdByUserId: request.user.id });
  response.status(201).json({ tag });
}

export async function replaceCompanyAssignments(request, response) {
  const company = await findCompanyById(request.params.companyId);
  if (!company) {
    throw httpError(404, 'COMPANY_NOT_FOUND', 'The company does not exist.');
  }

  const ownsCompany = request.user.companyId === request.params.companyId;
  if (!ownsCompany && request.user.role !== 'system_admin') {
    throw httpError(403, 'FORBIDDEN', 'You cannot update tags for this company.');
  }

  const assignments = validateCompanyTagAssignments(request.body);
  const updatedCompany = await replaceCompanyTagAssignments(request.params.companyId, assignments, request.user.id);
  response.json({ company: updatedCompany });
}

export async function replaceTorAssignments(request, response) {
  const assignments = validateTorTagAssignments(request.body);
  const tor = await replaceTorTagAssignments(request.params.torId, assignments, request.user.id);
  if (!tor) {
    throw httpError(404, 'TOR_NOT_FOUND', 'The TOR does not exist.');
  }
  response.json({ tor });
}
