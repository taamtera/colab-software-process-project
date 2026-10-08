import { findThumbnailByProjectId } from '../repositories/thumbnail.repository.mjs';
import { findTorByProjectId } from '../repositories/tor.repository.mjs';

export function createThumbnailHandler({ findThumbnail = findThumbnailByProjectId, findProject = findTorByProjectId } = {}) {
  return async function getByProjectId(request, response) {
    // Recheck successes and 404s because thumbnails can arrive after the project.
    response.setHeader('Cache-Control', 'no-store');
    const projectId = request.params.projectId;
    const [thumbnail, project] = await Promise.all([
      findThumbnail(projectId), findProject(projectId)
    ]);
    if (!thumbnail?.data || !project?.documentUrl || thumbnail.sourceUrl !== project.documentUrl) {
      response.status(404).end();
      return;
    }
    const image = Buffer.from(thumbnail.data, 'base64');
    if (image.length === 0) {
      response.status(404).end();
      return;
    }
    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.send(image);
  };
}

export const getByProjectId = createThumbnailHandler();
