import { Router } from 'express';
import * as thumbnailController from '../controllers/thumbnail.controller.mjs';

function handle(controller) {
  return (request, response, next) => Promise.resolve(controller(request, response, next)).catch(next);
}

export const thumbnailRouter = Router();

thumbnailRouter.get('/:templateId', handle(thumbnailController.getByTemplateId));
