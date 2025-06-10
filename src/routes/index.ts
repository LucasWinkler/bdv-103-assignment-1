import zodRouter from 'koa-zod-router';

import booksRouter from './books.route';
import ordersRouter from './orders.route';
import warehouseRouter from './warehouse.route';

const router = zodRouter();

router.use(booksRouter.routes(), booksRouter.allowedMethods());
router.use(warehouseRouter.routes(), warehouseRouter.allowedMethods());
router.use(ordersRouter.routes(), ordersRouter.allowedMethods());

export default router;
