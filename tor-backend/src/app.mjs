import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.mjs';
import { errorHandler, notFoundHandler } from './middleware/error-handler.mjs';
import { requestContext } from './middleware/request-context.mjs';
import { healthRouter } from './routes/health.routes.mjs';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error('This website is not allowed to call the API.');
    error.status = 403;
    error.code = 'CORS_ORIGIN_DENIED';
    callback(error);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(requestContext);

app.get('/api', (request, response) => {
  response.json({
    service: 'TOR Software API',
    status: 'running',
    requestId: request.requestId
  });
});

app.use('/api/health', healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);

