import zodRouter from 'koa-zod-router';
import { z } from 'zod';

import { getDefaultWarehouseDatabase } from '../data/warehouse.data';

const warehouseRouter = zodRouter({
  zodRouter: {
    exposeRequestErrors: true,
    exposeResponseErrors: true,
    validationErrorHandler: async (ctx, next) => {
      if (ctx.invalid.error) {
        ctx.status = 422;
        ctx.body = {
          message: 'Validation failed',
          errors: ctx.invalid.query?.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        };
      } else {
        await next();
      }
    },
  },
});

warehouseRouter.get({
  path: '/warehouse/stock/:bookId',
  name: 'getBookStock',
  handler: async (ctx) => {
    const { bookId } = ctx.request.params;

    try {
      const { getBookStock } = await getDefaultWarehouseDatabase();
      const stock = await getBookStock(bookId);
      ctx.body = { bookId, stock };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
    }
  },
  validate: {
    params: z.object({ bookId: z.string() }),
    response: z.object({ bookId: z.string(), stock: z.number() }),
  },
});

warehouseRouter.get({
  path: '/warehouse/stock',
  name: 'getAllBookStocks',
  handler: async (ctx) => {
    try {
      const { getAllBookStocks } = await getDefaultWarehouseDatabase();
      const stocks = await getAllBookStocks();
      ctx.body = stocks;
    } catch (error) {
      console.error(error);
      ctx.status = 500;
    }
  },
  validate: {
    response: z.record(z.string(), z.number()),
  },
});

warehouseRouter.post({
  path: '/warehouse/place',
  name: 'placeBooksOnShelf',
  handler: async (ctx) => {
    const { bookId, shelf, numberOfBooks } = ctx.request.body;
    try {
      const { placeBooksOnShelf } = await getDefaultWarehouseDatabase();
      await placeBooksOnShelf(bookId, shelf, numberOfBooks);
      ctx.status = 204;
    } catch (error) {
      console.error(error);
      ctx.status = 500;
    }
  },
  validate: {
    body: z.object({
      bookId: z.string(),
      shelf: z.string(),
      numberOfBooks: z.number(),
    }),
    response: z.undefined(),
  },
});

warehouseRouter.get({
  path: '/warehouse/shelves/:bookId',
  name: 'findBookOnShelf',
  handler: async (ctx) => {
    const { bookId } = ctx.request.params;
    try {
      const { findBookOnShelf } = await getDefaultWarehouseDatabase();
      const shelves = await findBookOnShelf(bookId);
      ctx.body = shelves;
    } catch (error) {
      console.error(error);
      ctx.status = 500;
    }
  },
  validate: {
    params: z.object({ bookId: z.string() }),
    response: z.array(z.object({ shelf: z.string(), quantity: z.number() })),
  },
});

export default warehouseRouter;
