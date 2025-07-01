import { Collection, ObjectId } from 'mongodb';

import { Order, WarehouseBook } from '../../adapter/assignment-4';
import { cleanupDatabase } from '../db';
import { BookDatabaseAccessor, getBookDatabase } from '../db/books';
import { getOrdersDatabase, OrdersDatabaseAccessor } from '../db/orders';
import { seedDb } from '../db/seed';
import {
  getWarehouseDatabase,
  WarehouseDatabaseAccessor,
} from '../db/warehouse';

export async function orderBooks(
  bookIds: string[],
  orders_collection: Collection<Order>
): Promise<{ orderId: string }> {
  const books: Record<string, number> = {};
  for (const id of bookIds) {
    books[id] = (books[id] || 0) + 1;
  }

  const result = await orders_collection.insertOne({
    _id: new ObjectId().toString(),
    books,
    fulfilled: false,
  });
  return { orderId: result.insertedId.toString() };
}

export async function listOrders(
  orders_collection: Collection<Order>
): Promise<Array<{ orderId: string; books: Record<string, number> }>> {
  const orders = await orders_collection.find({ fulfilled: false }).toArray();
  return orders.map((order) => ({ orderId: order._id, books: order.books }));
}

export async function fulfilOrder(
  orderId: string,
  booksFulfilled: Array<{
    book: string;
    shelf: string;
    numberOfBooks: number;
  }>,
  orders_collection: Collection<Order>,
  warehouse_collection: Collection<WarehouseBook>
): Promise<void> {
  const order = await orders_collection.findOne({ _id: orderId });
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
    { _id: orderId },
    { $set: { fulfilled: true } }
  );
}

if (import.meta.vitest !== undefined) {
  const { describe, it, expect, beforeEach, afterAll } = import.meta.vitest;
  let bookAccessor: BookDatabaseAccessor;
  let ordersAccessor: OrdersDatabaseAccessor;
  let warehouseAccessor: WarehouseDatabaseAccessor;
  let seededBooks: Record<string, ObjectId>;

  describe('orders service', () => {
    beforeEach(async () => {
      bookAccessor = getBookDatabase();
      ordersAccessor = getOrdersDatabase();
      warehouseAccessor = getWarehouseDatabase();
      const { books } = await seedDb(bookAccessor);
      seededBooks = books;
    });

    afterAll(async () => {
      await cleanupDatabase(bookAccessor.database);
    });

    describe('orderBooks', () => {
      it('creates an order with correct book quantities', async () => {
        const { orders_collection } = ordersAccessor;
        const bookIds = [
          seededBooks[0].toString(),
          seededBooks[0].toString(),
          seededBooks[1].toString(),
        ];

        const { orderId } = await orderBooks(bookIds, orders_collection);
        const orders = await listOrders(orders_collection);

        expect(orders[0]).toEqual({
          orderId,
          books: {
            [seededBooks[0].toString()]: 2,
            [seededBooks[1].toString()]: 1,
          },
        });
      });
    });

    describe('fulfilOrder', () => {
      it('successfully fulfills an order when stock is available', async () => {
        const { orders_collection } = ordersAccessor;
        const { warehouse_collection } = warehouseAccessor;
        const bookId = seededBooks[0].toString();

        const { orderId } = await orderBooks([bookId], orders_collection);

        await warehouse_collection.insertOne({
          bookId,
          shelf: 'shelf1',
          quantity: 1,
        });

        await fulfilOrder(
          orderId,
          [{ book: bookId, shelf: 'shelf1', numberOfBooks: 1 }],
          orders_collection,
          warehouse_collection
        );

        const orders = await listOrders(orders_collection);
        expect(orders).toHaveLength(0);
      });

      it('throws error when trying to fulfill order with insufficient stock', async () => {
        const { orders_collection } = ordersAccessor;
        const { warehouse_collection } = warehouseAccessor;
        const bookId = seededBooks[1].toString();

        const { orderId } = await orderBooks([bookId], orders_collection);

        await expect(
          fulfilOrder(
            orderId,
            [{ book: bookId, shelf: 'shelf1', numberOfBooks: 1 }],
            orders_collection,
            warehouse_collection
          )
        ).rejects.toThrow('Not enough stock for book');
      });

      it('throws error when fulfilled quantity does not match order', async () => {
        const { orders_collection } = ordersAccessor;
        const { warehouse_collection } = warehouseAccessor;
        const bookId = seededBooks[0].toString();

        const { orderId } = await orderBooks(
          [bookId, bookId],
          orders_collection
        );

        await expect(
          fulfilOrder(
            orderId,
            [{ book: bookId, shelf: 'shelf1', numberOfBooks: 1 }],
            orders_collection,
            warehouse_collection
          )
        ).rejects.toThrow('Fulfilled quantity for book');
      });

      it('throws error when order is already fulfilled', async () => {
        const { orders_collection } = ordersAccessor;
        const { warehouse_collection } = warehouseAccessor;
        const bookId = seededBooks[0].toString();

        const { orderId } = await orderBooks([bookId], orders_collection);

        await warehouse_collection.insertOne({
          bookId,
          shelf: 'shelf1',
          quantity: 1,
        });

        await fulfilOrder(
          orderId,
          [{ book: bookId, shelf: 'shelf1', numberOfBooks: 1 }],
          orders_collection,
          warehouse_collection
        );

        await expect(
          fulfilOrder(
            orderId,
            [{ book: bookId, shelf: 'shelf1', numberOfBooks: 1 }],
            orders_collection,
            warehouse_collection
          )
        ).rejects.toThrow('Order already fulfilled');
      });

      it('throws error when order is not found', async () => {
        const { orders_collection } = ordersAccessor;
        const { warehouse_collection } = warehouseAccessor;
        const nonExistentOrderId = new ObjectId().toString();

        await expect(
          fulfilOrder(
            nonExistentOrderId,
            [
              {
                book: seededBooks[0].toString(),
                shelf: 'shelf1',
                numberOfBooks: 1,
              },
            ],
            orders_collection,
            warehouse_collection
          )
        ).rejects.toThrow('Order not found');
      });
    });
  });
}
