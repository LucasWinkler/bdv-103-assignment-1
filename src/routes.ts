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

const querySchema = z.object({
  filters: filterSchema,
});

const responseSchema = z.union([
  z.array(bookSchema),
  z.object({
    error: z.string(),
  }),
]);

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
    try {
      const { filters } = ctx.request.query;
      const books = await adapter.listBooks(filters);
      ctx.body = books;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: `Failed to fetch books due to: ${error}` };
    }
  },
  {
    query: querySchema,
    response: responseSchema,
  }
);

export default router;
