import { Router } from 'express';
import * as tagController from '../controllers/tag.controller.mjs';
import { authenticate } from '../middleware/authenticate.mjs';
import { authorize } from '../middleware/authorize.mjs';

function handle(controller) {
  return (request, response, next) => Promise.resolve(controller(request, response, next)).catch(next);
}

export const tagRouter = Router();

tagRouter.get('/', handle(tagController.list));
tagRouter.post('/', authenticate, authorize('system_admin'), handle(tagController.create));
tagRouter.put('/companies/:companyId', authenticate, handle(tagController.replaceCompanyAssignments));
tagRouter.put('/tors/:torId', authenticate, authorize('project_manager', 'system_admin'), handle(tagController.replaceTorAssignments));
