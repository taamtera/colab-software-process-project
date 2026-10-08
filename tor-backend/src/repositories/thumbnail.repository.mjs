import { getDatabase } from '../config/database.mjs';

export async function findThumbnailByProjectId(projectId) {
  return getDatabase().collection('thumbnails').findOne(
    { projectId },
    { projection: { data: 1, contentType: 1, sourceUrl: 1, updatedAt: 1 } }
  );
}
