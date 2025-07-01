import cors from '@koa/cors';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import qs from 'koa-qs';
import { koaSwagger } from 'koa2-swagger-ui';

import { RegisterRoutes } from '../build/routes';
import swagger from '../build/swagger.json';
import { getDefaultBooksDatabase } from './data/books.data';
import { getDefaultOrdersDatabase } from './data/orders.data';
import { getDefaultWarehouseDatabase } from './data/warehouse.data';
import zodRouter from './routes';
import { AppState } from './types/state';

import type { Server } from 'http';

export async function createServer(
  port: number = 0,
  randomizeDbNames: boolean = false
): Promise<{ server: Server; state: AppState }> {
  const state: AppState = {
    books: await getDefaultBooksDatabase(
      getDbName(randomizeDbNames, 'bdv-103-books')
    ),
    warehouse: await getDefaultWarehouseDatabase(
      getDbName(randomizeDbNames, 'bdv-103-warehouse')
    ),
    orders: await getDefaultOrdersDatabase(
      getDbName(randomizeDbNames, 'bdv-103-orders')
    ),
  };

  const app = new Koa<AppState, Koa.DefaultContext>();
  const koaRouter = new KoaRouter();

  app.use(async (ctx, next): Promise<void> => {
    ctx.state = state;
    await next();
  });

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

  return { server, state };
}

function getDbName(
  randomizeDbNames: boolean,
  dbName: string
): string | undefined {
  return randomizeDbNames ? undefined : dbName;
}
