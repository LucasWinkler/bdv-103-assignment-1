import zodRouter from 'koa-zod-router';
import { Db, ObjectId } from 'mongodb';
import { z } from 'zod';

import { createBookSchema, updateBookSchema } from '../adapter/assignment-2.js';
import { bookFilterSchema, bookSchema } from '../adapter/assignment-3.js';

const router = zodRouter({
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

router.get({
  path: '/books',
  name: 'getBooks',
  handler: async (ctx) => {
    try {
      const db = ctx.state.db as Db;
      const { filters } = ctx.request.query;

      const query =
        filters && filters.length > 0
          ? {
              $or: filters.map((filter) => {
                const conditions: {
                  price?: { $gte?: number; $lte?: number };
                  name?: { $regex: string; $options: string };
                  author?: { $regex: string; $options: string };
                } = {};

                if (
                  (filter.from !== undefined && !isNaN(filter.from)) ||
                  (filter.to !== undefined && !isNaN(filter.to))
                ) {
                  conditions.price = {
                    ...(filter.from !== undefined &&
                      !isNaN(filter.from) && { $gte: filter.from }),
                    ...(filter.to !== undefined &&
                      !isNaN(filter.to) && { $lte: filter.to }),
                  };
                }

                if (filter.name !== undefined) {
                  conditions.name = { $regex: filter.name, $options: 'i' };
                }

                if (filter.author !== undefined) {
                  conditions.author = { $regex: filter.author, $options: 'i' };
                }

                return conditions;
              }),
            }
          : {};

      const books = await db.collection('books').find(query).toArray();

      ctx.body = books.map((book) => ({
        id: book._id.toString(),
        name: book.name,
        author: book.author,
        description: book.description,
        price: book.price,
        image: book.image,
      }));
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
  handler: async (ctx) => {
    try {
      const db = ctx.state.db as Db;
      const { body } = ctx.request;

      const result = await db.collection('books').insertOne(body);
      const newBook = { ...body, id: result.insertedId.toString() };

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
  handler: async (ctx) => {
    try {
      const db = ctx.state.db as Db;
      const { params, body } = ctx.request;

      const result = await db
        .collection('books')
        .findOneAndUpdate(
          { _id: new ObjectId(params.id) },
          { $set: body },
          { includeResultMetadata: true }
        );

      if (!result?.value) {
        ctx.status = 404;
        ctx.body = { error: 'Book not found' };
        return;
      }

      ctx.body = {
        id: result.value._id.toString(),
        name: result.value.name,
        author: result.value.author,
        description: result.value.description,
        price: result.value.price,
        image: result.value.image,
      };
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
  handler: async (ctx) => {
    try {
      const db = ctx.state.db as Db;
      const { params } = ctx.request;

      const result = await db
        .collection('books')
        .deleteOne({ _id: new ObjectId(params.id) });

      if (result.deletedCount === 0) {
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
      z.undefined(),
      z.object({
        error: z.string(),
      }),
    ]),
  },
});

export default router;
