import zodRouter from 'koa-zod-router';

import booksRouter from './books.route';

const router = zodRouter();

router.use('/books', booksRouter.routes(), booksRouter.allowedMethods());

export default router;
