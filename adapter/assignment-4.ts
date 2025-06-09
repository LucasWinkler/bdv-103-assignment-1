/* eslint-disable @typescript-eslint/no-unused-vars */
import z from 'zod';

import previous_assignment from './assignment-3';

export const bookSchema = z.object({
  id: z.string(),
  name: z.string(),
  author: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
});

export const bookFilterSchema = z
  .array(
    z
      .object({
        from: z.coerce.number().optional(),
        to: z.coerce.number().optional(),
        name: z.string().optional(),
        author: z.string().optional(),
      })
      .strict()
  )
  .optional();

export type Book = z.infer<typeof bookSchema>;
export type BookFilter = z.infer<typeof bookFilterSchema>;

export const warehouseBookSchema = z.object({
  bookId: z.string(),
  shelfId: z.string(),
  quantity: z.number(),
});

export type WarehouseBook = z.infer<typeof warehouseBookSchema>;

export const orderSchema = z.object({
  id: z.string(),
  books: z.record(z.string(), z.number()),
});

export type Order = z.infer<typeof orderSchema>;

async function listBooks(filters?: BookFilter): Promise<Book[]> {
  const books = await previous_assignment.listBooks(filters);
  return books;
}

async function createOrUpdateBook(book: Book): Promise<Book['id']> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: Book['id']): Promise<void> {
  await previous_assignment.removeBook(book);
}

async function lookupBookById(book: Book['id']): Promise<Book> {
  // TODO: Implement. This needs to hit an api route similar to that of the previous assignment. We need to get the book from the database and include the stock count.
  throw new Error('Todo');
}

async function placeBooksOnShelf(
  bookId: Book['id'],
  numberOfBooks: number,
  shelfId: WarehouseBook['shelfId']
): Promise<void> {
  throw new Error('Todo');
}

async function orderBooks(
  order: Book['id'][]
): Promise<{ orderId: Order['id'] }> {
  throw new Error('Todo');
}

async function findBookOnShelf(
  book: Book['id']
): Promise<Array<{ shelfId: WarehouseBook['shelfId']; quantity: number }>> {
  throw new Error('Todo');
}

async function fulfilOrder(
  order: Order['id'],
  booksFulfilled: Array<{
    book: Book['id'];
    shelfId: WarehouseBook['shelfId'];
    numberOfBooks: number;
  }>
): Promise<void> {
  throw new Error('Todo');
}

async function listOrders(): Promise<
  Array<{ orderId: Order['id']; books: Record<Book['id'], number> }>
> {
  throw new Error('Todo');
}

const assignment = 'assignment-4';

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
  placeBooksOnShelf,
  orderBooks,
  findBookOnShelf,
  fulfilOrder,
  listOrders,
  lookupBookById,
};
