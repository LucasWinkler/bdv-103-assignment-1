import zodRouter from 'koa-zod-router';
import { z } from 'zod';

import {
  bookFilterSchema,
  bookInputSchema,
  bookSchema,
} from '../../adapter/assignment-4';
import { getBookDatabase } from '../db';
import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook,
} from '../services/books.service';

const booksRouter = zodRouter({
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

booksRouter.get({
  path: '/books',
  name: 'getBooks',
  handler: async (ctx) => {
    const { filters } = ctx.request.query;
    try {
      const { book_collection, warehouse_collection } = getBookDatabase();
      const books = await listBooks(
        filters,
        book_collection,
        warehouse_collection
      );
      ctx.body = books;
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

booksRouter.get({
  path: '/books/:id',
  name: 'getBookById',
  handler: async (ctx) => {
    const { id } = ctx.request.params;
    try {
      const { book_collection, warehouse_collection } = getBookDatabase();
      const book = await getBookById(id, book_collection, warehouse_collection);
      ctx.body = book;
    } catch (error) {
      if (error instanceof Error && error.message === 'Book not found') {
        ctx.status = 404;
        ctx.body = { error: error.message };
        return;
      }
      ctx.status = 500;
      ctx.body = { error: `Failed to fetch book due to: ${error}` };
    }
  },
  validate: {
    params: z.object({ id: z.string() }),
    response: z.union([bookSchema, z.object({ error: z.string() })]),
  },
});

booksRouter.post({
  path: '/books',
  name: 'createBook',
  handler: async (ctx) => {
    const { body } = ctx.request;
    try {
      const { book_collection } = getBookDatabase();
      const newBook = await createBook(body, book_collection);
      ctx.status = 201;
      ctx.body = newBook;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: `Failed to create book due to: ${error}` };
    }
  },
  validate: {
    body: bookInputSchema,
    response: z.union([
      bookSchema,
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

booksRouter.put({
  path: '/books/:id',
  name: 'updateBook',
  handler: async (ctx) => {
    const { params, body } = ctx.request;
    try {
      const { book_collection, warehouse_collection } = getBookDatabase();
      const updatedBook = await updateBook(
        params.id,
        body,
        book_collection,
        warehouse_collection
      );
      ctx.body = updatedBook;
    } catch (error) {
      if (error instanceof Error && error.message === 'Book not found') {
        ctx.status = 404;
        ctx.body = { error: error.message };
        return;
      }

      ctx.status = 500;
      ctx.body = { error: `Failed to update book due to: ${error}` };
    }
  },
  validate: {
    params: z.object({ id: z.string() }),
    body: bookInputSchema,
    response: z.union([
      bookSchema,
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

booksRouter.delete({
  path: '/books/:id',
  name: 'deleteBook',
  handler: async (ctx) => {
    const { params } = ctx.request;
    const { book_collection } = getBookDatabase();
    try {
      await deleteBook(params.id, book_collection);

      ctx.status = 204;
    } catch (error) {
      if (error instanceof Error && error.message === 'Book not found') {
        ctx.status = 404;
        ctx.body = { error: error.message };
        return;
      }

      ctx.status = 500;
      ctx.body = { error: `Failed to delete book due to: ${error}` };
    }
  },
  validate: {
    params: z.object({ id: z.string() }),
    response: z.union([
      z.undefined(),
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

export default booksRouter;
