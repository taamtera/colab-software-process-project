import { getDatabase } from '../config/database.mjs';

function thumbnails() {
  return getDatabase().collection('thumbnails');
}

export async function findThumbnailByTemplateId(templateId) {
  return thumbnails().findOne(
    { templateId },
    { projection: { data: 1, contentType: 1 } }
  );
}
