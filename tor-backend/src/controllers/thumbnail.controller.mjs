import { findThumbnailByTemplateId } from '../repositories/thumbnail.repository.mjs';

export async function getByTemplateId(request, response) {
  const thumbnail = await findThumbnailByTemplateId(request.params.templateId);
  if (!thumbnail?.data) {
    response.status(404).end();
    return;
  }

  const image = Buffer.from(thumbnail.data, 'base64');
  if (image.length === 0) {
    response.status(404).end();
    return;
  }

  const contentType = typeof thumbnail.contentType === 'string' && thumbnail.contentType.startsWith('image/')
    ? thumbnail.contentType
    : 'image/webp';

  response.setHeader('Content-Type', contentType);
  response.setHeader('Cache-Control', 'public, max-age=86400');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.send(image);
}
