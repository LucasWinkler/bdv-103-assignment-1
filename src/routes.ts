import zodRouter from 'koa-zod-router';
import { z } from 'zod';

import {
  Book,
  bookFilterSchema,
  bookSchema,
  createBookSchema,
  updateBookSchema,
} from '../adapter/assignment-2';
import { bookStore } from './books';

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
        ctx.body = {
          message: `Some wierd error failed ${ctx}`,
        };
        await next();
      }
    },
  },
});

router.get({
  path: '/books',
  name: 'getBooks',
  handler: async ctx => {
    try {
      const { filters } = ctx.request.query;
      if (!filters || filters.length === 0) {
        ctx.body = bookStore.getAll();
        return;
      }

      const filteredBooks = bookStore
        .getAll()
        .filter(book =>
          filters.some(
            filter =>
              (filter.from === undefined || book.price >= filter.from) &&
              (filter.to === undefined || book.price <= filter.to)
          )
        );

      ctx.body = filteredBooks;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: `Failed to fetch books due to: ${error}` };
    }
  },
  validate: {
    query: z.object({ filters: bookFilterSchema }),
    response: z.union([
      z.array(bookSchema),
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

router.post({
  path: '/books',
  name: 'createBook',
  handler: async ctx => {
    console.log('ctx', ctx);
    try {
      const newBook = bookStore.create(ctx.request.body);

      ctx.status = 201;
      ctx.body = newBook;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: `Failed to create book due to: ${error}` };
    }
  },
  validate: {
    body: createBookSchema,
    response: z.union([
      bookSchema,
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

router.put({
  path: '/books/:id',
  name: 'updateBook',
  handler: async ctx => {
    try {
      const updatedBook = bookStore.update(
        ctx.params.id,
        ctx.request.body as Book
      );

      if (!updatedBook) {
        ctx.status = 404;
        ctx.body = { error: 'Book not found' };
        return;
      }
      ctx.body = updatedBook;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: `Failed to update book due to: ${error}` };
    }
  },
  validate: {
    params: z.object({ id: z.string() }),
    body: updateBookSchema,
    response: z.union([
      bookSchema,
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

router.delete({
  path: '/books/:id',
  name: 'deleteBook',
  handler: async ctx => {
    try {
      const deletedBook = bookStore.delete(ctx.params.id);
      if (!deletedBook) {
        ctx.status = 404;
        ctx.body = { error: 'Book not found' };
        return;
      }

      ctx.status = 204;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: `Failed to delete book due to: ${error}` };
    }
  },
  validate: {
    params: z.object({ id: z.string() }),
    response: z.union([
      z.null(),
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

export default router;
