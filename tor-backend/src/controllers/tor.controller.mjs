import { findTorById, findTorByTemplateId, listTors, updateTor } from '../repositories/tor.repository.mjs';
import { env } from '../config/env.mjs';
import { serializeTor } from '../serializers/tor.serializer.mjs';
import { httpError } from '../utils/http-error.mjs';
import { validateTorUpdate } from '../validators/tor.validators.mjs';

export async function list(request, response) {
  const tagIds = request.query.tagIds
    ? (Array.isArray(request.query.tagIds) ? request.query.tagIds : request.query.tagIds.split(',')).filter(Boolean)
    : [];
  const result = await listTors({ ...request.query, tagIds });
  response.json({ ...result, items: result.items.map(serializeTor) });
}

export async function getById(request, response) {
  const tor = await findTorById(request.params.torId);
  if (!tor) {
    throw httpError(404, 'TOR_NOT_FOUND', 'The TOR does not exist.');
  }
  response.json({ tor: serializeTor(tor) });
}

async function getDocument(request, response, disposition) {
  const tor = await findTorByTemplateId(request.params.templateId);
  const documentUrl = tor?.documentUrl || tor?.url;
  if (!documentUrl) {
    response.status(404).end();
    return;
  }

  let source;
  try {
    source = new URL(documentUrl);
  } catch {
    response.status(404).end();
    return;
  }

  const allowedHosts = ['process.gprocurement.go.th', 'process5.gprocurement.go.th'];
  if (source.protocol !== 'https:' || !allowedHosts.includes(source.hostname)) {
    response.status(403).json({ error: { code: 'DOCUMENT_HOST_NOT_ALLOWED', message: 'The document host is not allowed.' } });
    return;
  }

  const documentResponse = await fetch(source);
  if (!documentResponse.ok || !documentResponse.body) {
    response.status(404).end();
    return;
  }

  const buffer = Buffer.from(await documentResponse.arrayBuffer());
  response.setHeader('Content-Type', documentResponse.headers.get('content-type') || 'application/pdf');
  response.setHeader('Content-Disposition', `${disposition}; filename="${request.params.templateId}.pdf"`);
  response.setHeader('Cache-Control', 'private, max-age=3600');
  response.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${env.frontendOrigins.join(' ')};`);
  response.removeHeader('X-Frame-Options');
  response.removeHeader('Cross-Origin-Opener-Policy');
  response.send(buffer);
}

export function previewDocument(request, response) {
  return getDocument(request, response, 'inline');
}

export function downloadDocument(request, response) {
  return getDocument(request, response, 'attachment');
}

export async function update(request, response) {
  const changes = validateTorUpdate(request.body);
  const tor = await updateTor(request.params.torId, changes, request.user.id);
  if (!tor) {
    throw httpError(404, 'TOR_NOT_FOUND', 'The TOR does not exist.');
  }
  response.json({ tor: serializeTor(tor) });
}
