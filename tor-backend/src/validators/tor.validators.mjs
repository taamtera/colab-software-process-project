import { httpError } from '../utils/http-error.mjs';

const TOR_STATUSES = ['draft', 'open', 'closed', 'cancelled', 'awarded'];
const UPDATE_FIELDS = [
  'title',
  'description',
  'summary',
  'category',
  'departmentName',
  'publishedAt',
  'submissionDeadline',
  'projectStartAt',
  'projectEndAt',
  'sourceUrl',
  'url',
  'documentUrl',
  'thumbnail',
  'status',
  'budget'
];

function invalid(message) {
  throw httpError(400, 'INVALID_TOR_INPUT', message);
}

function optionalText(value, fieldName) {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    invalid(`${fieldName} must be text or null.`);
  }
  return value.trim();
}

function optionalDate(value, fieldName) {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    invalid(`${fieldName} must be a valid ISO date or null.`);
  }
  return new Date(value);
}

function validateBudget(value) {
  if (value === null) {
    return null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    invalid('budget must be an object or null.');
  }

  const allowedFields = ['minAmount', 'maxAmount', 'currency', 'sourceText'];
  const unknownField = Object.keys(value).find((field) => !allowedFields.includes(field));
  if (unknownField) {
    invalid(`budget.${unknownField} cannot be updated.`);
  }

  const budget = {};
  for (const field of allowedFields) {
    if (value[field] === undefined) {
      continue;
    }
    if (['minAmount', 'maxAmount'].includes(field)) {
      if (typeof value[field] !== 'number' || !Number.isFinite(value[field]) || value[field] < 0) {
        invalid(`budget.${field} must be a non-negative number.`);
      }
      budget[field] = value[field];
      continue;
    }
    budget[field] = optionalText(value[field], `budget.${field}`);
  }
  return budget;
}

export function validateTorUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    invalid('The request body must be an object.');
  }

  const unknownField = Object.keys(body).find((field) => !UPDATE_FIELDS.includes(field));
  if (unknownField) {
    invalid(`${unknownField} cannot be updated.`);
  }
  if (Object.keys(body).length === 0) {
    invalid('At least one TOR field is required.');
  }

  const update = {};
  for (const field of ['title', 'description', 'summary', 'category', 'departmentName', 'sourceUrl', 'url', 'documentUrl', 'thumbnail']) {
    if (body[field] !== undefined) {
      update[field] = optionalText(body[field], field);
    }
  }
  for (const field of ['publishedAt', 'submissionDeadline', 'projectStartAt', 'projectEndAt']) {
    if (body[field] !== undefined) {
      update[field] = optionalDate(body[field], field);
    }
  }
  if (body.status !== undefined) {
    if (!TOR_STATUSES.includes(body.status)) {
      invalid('status is invalid.');
    }
    update.status = body.status;
  }
  if (body.budget !== undefined) {
    update.budget = validateBudget(body.budget);
  }

  return update;
}
