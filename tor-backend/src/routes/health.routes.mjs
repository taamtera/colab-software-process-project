import { Router } from 'express';
import { getDatabase } from '../config/database.mjs';

export const healthRouter = Router();

healthRouter.get('/', async (request, response, next) => {
  try {
    await getDatabase().command({ ping: 1 });
    response.json({
      status: 'ok',
      service: 'tor-software-backend',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

