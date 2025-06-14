import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import qs from 'koa-qs';

import router from './routes';

const app = new Koa();
qs(app);

app.use(logger());
app.use(
  cors({
    origin: 'http://localhost:9080',
  })
);
app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
