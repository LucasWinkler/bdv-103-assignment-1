import { ObjectId } from 'mongodb';

import { getBookDatabase } from '../db';

export async function orderBooks(
  bookIds: string[]
): Promise<{ orderId: string }> {
  const { orders_collection } = getBookDatabase();

  const books: Record<string, number> = {};
  for (const id of bookIds) {
    books[id] = (books[id] || 0) + 1;
  }

  const result = await orders_collection.insertOne({
    id: new ObjectId().toString(),
    books,
    fulfilled: false,
  });
  return { orderId: result.insertedId.toString() };
}

export async function listOrders(): Promise<
  Array<{ orderId: string; books: Record<string, number> }>
> {
  const { orders_collection } = getBookDatabase();
  const orders = await orders_collection.find({ fulfilled: false }).toArray();
  return orders.map((order) => ({ orderId: order.id, books: order.books }));
}

export async function fulfilOrder(
  orderId: string,
  booksFulfilled: Array<{
    book: string;
    shelf: string;
    numberOfBooks: number;
  }>
): Promise<void> {
  const { orders_collection, warehouse_collection } = getBookDatabase();

  const order = await orders_collection.findOne({ id: orderId });
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.fulfilled) {
    throw new Error('Order already fulfilled');
  }

  const tally: Record<string, number> = {};
  for (const entry of booksFulfilled) {
    tally[entry.book] = (tally[entry.book] || 0) + entry.numberOfBooks;
  }

  for (const [bookId, qty] of Object.entries(order.books)) {
    if (tally[bookId] !== qty) {
      throw new Error(
        `Fulfilled quantity for book ${bookId} does not match order.`
      );
    }
  }

  for (const entry of booksFulfilled) {
    const warehouseItem = await warehouse_collection.findOne({
      bookId: entry.book,
      shelf: entry.shelf,
    });

    if (!warehouseItem || warehouseItem.quantity < entry.numberOfBooks) {
      throw new Error(
        `Not enough stock for book ${entry.book} on shelf ${entry.shelf}`
      );
    }

    await warehouse_collection.updateOne(
      { bookId: entry.book, shelf: entry.shelf },
      { $inc: { quantity: -entry.numberOfBooks } }
    );
  }

  await orders_collection.updateOne(
    { id: orderId },
    { $set: { fulfilled: true } }
  );
}
