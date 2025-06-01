import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import qs from 'koa-qs';

import { connectDb, dbMiddleware } from './db.js';
import routes from './routes.js';

const app = new Koa();
qs(app);

app.use(logger());
app.use(
  cors({
    origin: 'http://localhost:9080',
  })
);
app.use(bodyParser());
app.use(dbMiddleware);
app.use(routes.routes());
app.use(routes.allowedMethods());

const PORT = 3000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
