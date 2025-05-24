// TODO: Remove rule this when I am on this assignment
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

// If multiple filters are provided, any book that matches at least one of them should be returned
// Within a single filter, a book would need to match all the given conditions
async function listBooks(filters?: BookFilter[]): Promise<Book[]> {
  throw new Error('Todo');
}

async function createOrUpdateBook(book: Book): Promise<Book['id']> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: Book['id']): Promise<void> {
  await previous_assignment.removeBook(book);
}

async function lookupBookById(book: Book['id']): Promise<Book> {
  throw new Error('Todo');
}

export type ShelfId = string;
export type OrderId = string;

async function placeBooksOnShelf(
  bookId: Book['id'],
  numberOfBooks: number,
  shelf: ShelfId
): Promise<void> {
  throw new Error('Todo');
}

async function orderBooks(order: Book['id'][]): Promise<{ orderId: OrderId }> {
  throw new Error('Todo');
}

async function findBookOnShelf(
  book: Book['id']
): Promise<Array<{ shelf: ShelfId; count: number }>> {
  throw new Error('Todo');
}

async function fulfilOrder(
  order: OrderId,
  booksFulfilled: Array<{
    book: Book['id'];
    shelf: ShelfId;
    numberOfBooks: number;
  }>
): Promise<void> {
  throw new Error('Todo');
}

async function listOrders(): Promise<
  Array<{ orderId: OrderId; books: Record<Book['id'], number> }>
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
