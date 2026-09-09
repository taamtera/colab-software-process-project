import { findTorById, listTors, updateTor } from '../repositories/tor.repository.mjs';
import { httpError } from '../utils/http-error.mjs';
import { validateTorUpdate } from '../validators/tor.validators.mjs';

export async function list(request, response) {
  const tagIds = request.query.tagIds
    ? (Array.isArray(request.query.tagIds) ? request.query.tagIds : request.query.tagIds.split(',')).filter(Boolean)
    : [];
  const result = await listTors({ ...request.query, tagIds });
  response.json(result);
}

export async function getById(request, response) {
  const tor = await findTorById(request.params.torId);
  if (!tor) {
    throw httpError(404, 'TOR_NOT_FOUND', 'The TOR does not exist.');
  }
  response.json({ tor });
}

export async function update(request, response) {
  const changes = validateTorUpdate(request.body);
  const tor = await updateTor(request.params.torId, changes, request.user.id);
  if (!tor) {
    throw httpError(404, 'TOR_NOT_FOUND', 'The TOR does not exist.');
  }
  response.json({ tor });
}
