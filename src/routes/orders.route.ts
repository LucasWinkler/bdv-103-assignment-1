import zodRouter from 'koa-zod-router';
import { z } from 'zod';

import { getDefaultOrdersDatabase } from '../data/orders.data';

const ordersRouter = zodRouter({
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

ordersRouter.post({
  path: '/orders',
  name: 'orderBooks',
  handler: async (ctx) => {
    const { bookIds } = ctx.request.body;
    try {
      const { orderBooks } = await getDefaultOrdersDatabase();
      const result = await orderBooks(bookIds);
      ctx.body = result;
    } catch (error) {
      console.error(error);
      ctx.status = 500;
    }
  },
  validate: {
    body: z.object({ bookIds: z.array(z.string()) }),
    response: z.object({ orderId: z.string() }),
  },
});

ordersRouter.get({
  path: '/orders',
  name: 'listOrders',
  handler: async (ctx) => {
    try {
      const { listOrders } = await getDefaultOrdersDatabase();
      const orders = await listOrders();
      ctx.body = orders;
    } catch (error) {
      console.error(error);
      ctx.status = 500;
    }
  },
  validate: {
    response: z.array(
      z.object({ orderId: z.string(), books: z.record(z.string(), z.number()) })
    ),
  },
});

ordersRouter.post({
  path: '/orders/:id/fulfil',
  name: 'fulfilOrder',
  handler: async (ctx) => {
    const { id } = ctx.request.params;
    const { booksFulfilled } = ctx.request.body;
    try {
      const { fulfilOrder } = await getDefaultOrdersDatabase();
      await fulfilOrder(id, booksFulfilled);
      ctx.status = 204;
    } catch (error) {
      console.error(error);
      ctx.status = 500;
    }
  },
  validate: {
    params: z.object({ id: z.string() }),
    body: z.object({
      booksFulfilled: z.array(
        z.object({
          book: z.string(),
          shelf: z.string(),
          numberOfBooks: z.number(),
        })
      ),
    }),
    response: z.undefined(),
  },
});

export default ordersRouter;
