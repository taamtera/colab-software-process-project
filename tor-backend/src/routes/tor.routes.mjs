import { Router } from 'express';
import * as torController from '../controllers/tor.controller.mjs';
import { authenticate } from '../middleware/authenticate.mjs';
import { authorize } from '../middleware/authorize.mjs';

function handle(controller) {
  return (request, response, next) => Promise.resolve(controller(request, response, next)).catch(next);
}

export const torRouter = Router();

torRouter.get('/', handle(torController.list));
torRouter.get('/:torId', handle(torController.getById));
torRouter.patch('/:torId', authenticate, authorize('project_manager', 'system_admin'), handle(torController.update));
