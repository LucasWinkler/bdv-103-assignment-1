import z from 'zod';

import previous_assignment from './assignment-3';

export const bookInputSchema = z.object({
  name: z.string(),
  author: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
});

export const bookSchema = bookInputSchema.extend({
  id: z.string(),
  stock: z.number(),
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

export type BookInput = z.infer<typeof bookInputSchema>;
export type Book = z.infer<typeof bookSchema>;
export type BookFilter = z.infer<typeof bookFilterSchema>;

export const warehouseBookSchema = z.object({
  bookId: z.string(),
  shelf: z.string(),
  quantity: z.number(),
});

export type WarehouseBook = z.infer<typeof warehouseBookSchema>;

export const orderSchema = z.object({
  id: z.string(),
  books: z.record(z.string(), z.number()),
  fulfilled: z.boolean().optional(),
});

export type Order = z.infer<typeof orderSchema>;

type BookOnShelf = {
  shelf: WarehouseBook['shelf'];
  quantity: number;
};

async function listBooks(filters?: BookFilter): Promise<Book[]> {
  return (await previous_assignment.listBooks(filters)) as Book[];
}

async function createOrUpdateBook(book: Book): Promise<Book['id']> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: Book['id']): Promise<void> {
  await previous_assignment.removeBook(book);
}

async function lookupBookById(book: Book['id']): Promise<Book> {
  const response = await fetch(`http://localhost:3000/books/${book}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch book: ${response.statusText}`);
  }
  return (await response.json()) as Book;
}

async function placeBooksOnShelf(
  bookId: Book['id'],
  numberOfBooks: number,
  shelf: WarehouseBook['shelf']
): Promise<void> {
  const response = await fetch('http://localhost:3000/warehouse/place', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, shelf, numberOfBooks }),
  });
  if (!response.ok) {
    throw new Error(`Failed to place on shelf`);
  }
}

async function orderBooks(
  order: Book['id'][]
): Promise<{ orderId: Order['id'] }> {
  const response = await fetch('http://localhost:3000/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookIds: order }),
  });
  if (!response.ok) {
    throw new Error(`Failed to place order`);
  }
  return (await response.json()) as { orderId: Order['id'] };
}

async function findBookOnShelf(book: Book['id']): Promise<Array<BookOnShelf>> {
  const response = await fetch(
    `http://localhost:3000/warehouse/shelves/${book}`
  );
  if (!response.ok) {
    throw new Error(`Failed to find book on shelf: ${response.statusText}`);
  }
  return (await response.json()) as Array<BookOnShelf>;
}

async function fulfilOrder(
  order: Order['id'],
  booksFulfilled: Array<{
    book: Book['id'];
    shelf: WarehouseBook['shelf'];
    numberOfBooks: number;
  }>
): Promise<void> {
  const response = await fetch(`http://localhost:3000/orders/${order}/fulfil`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booksFulfilled }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function listOrders(): Promise<
  Array<{ orderId: Order['id']; books: Record<Book['id'], number> }>
> {
  const response = await fetch('http://localhost:3000/orders');
  if (!response.ok) {
    throw new Error(`Failed to list orders: ${response.statusText}`);
  }
  return (await response.json()) as Array<{
    orderId: Order['id'];
    books: Record<Book['id'], number>;
  }>;
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
