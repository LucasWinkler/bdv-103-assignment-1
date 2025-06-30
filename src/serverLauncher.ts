import cors from '@koa/cors';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import qs from 'koa-qs';
import { koaSwagger } from 'koa2-swagger-ui';

import { RegisterRoutes } from '../build/routes';
import swagger from '../build/swagger.json';
import zodRouter from './routes';

import type { Server } from 'http';

export function createServer(port: number = 0): Server {
  const app = new Koa();
  const koaRouter = new KoaRouter();

  qs(app);

  app.use(logger());
  app.use(
    cors({
      origin: 'http://localhost:9080',
    })
  );
  app.use(bodyParser());

  // Old routes
  app.use(zodRouter.routes());
  app.use(zodRouter.allowedMethods());

  // New routes
  RegisterRoutes(koaRouter);
  app.use(koaRouter.routes());
  app.use(koaRouter.allowedMethods());

  app.use(
    koaSwagger({
      routePrefix: '/docs',
      specPrefix: '/docs/spec',
      exposeSpec: true,
      swaggerOptions: { spec: swagger },
    })
  );

  const server = app.listen(port, () => {
    const address = server.address();
    const actualPort =
      typeof address === 'object' && address ? address.port : port;

    console.log(`Server running on http://localhost:${actualPort}`);
  });

  return server;
}
