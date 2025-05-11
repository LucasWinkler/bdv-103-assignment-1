import zodRouter from 'koa-zod-router';
import { z } from 'zod';
import adapter from '../adapter';
import { bookSchema } from '../adapter/assignment-1';

const filterSchema = z
  .array(
    z
      .object({
        from: z.coerce.number().optional(),
        to: z.coerce.number().optional(),
      })
      .strict()
  )
  .optional();

const router = zodRouter({
  zodRouter: {
    exposeRequestErrors: true,
    exposeResponseErrors: true,
    validationErrorHandler: async (ctx, next) => {
      if (ctx.invalid.error) {
        ctx.status = 422;
        ctx.body = {
          message: 'Validation failed',
          errors: ctx.invalid.query?.issues.map(issue => ({
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

router.get(
  '/books',
  async ctx => {
    const { filters } = ctx.request.query;
    const books = await adapter.listBooks(filters);
    ctx.body = books;
  },
  {
    query: z.object({ filters: filterSchema }),
    response: z.array(bookSchema),
  }
);

export default router;
