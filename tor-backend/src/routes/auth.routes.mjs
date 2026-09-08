import { Router } from 'express';
import * as auth from '../controllers/auth.controller.mjs';
import { authenticate } from '../middleware/authenticate.mjs';

// Wraps an async controller so thrown/rejected errors reach the shared error handler.
function handle(controller) {
  return (request, response, next) => Promise.resolve(controller(request, response, next)).catch(next);
}

export const authRouter = Router();

authRouter.post('/register', handle(auth.register));
authRouter.post('/login', handle(auth.login));
authRouter.post('/refresh', handle(auth.refresh));
authRouter.post('/logout', handle(auth.logout));
authRouter.post('/logout-all', authenticate, handle(auth.logoutAll));
authRouter.post('/forgot-password', handle(auth.forgotPassword));
authRouter.post('/reset-password', handle(auth.resetPassword));
authRouter.get('/me', authenticate, handle(auth.me));
