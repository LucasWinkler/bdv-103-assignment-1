import { Collection, ObjectId } from 'mongodb';

import { WarehouseBook } from '../../adapter/assignment-4';
import { BookDatabaseAccessor, cleanupDatabase, getBookDatabase } from '../db';

export async function getBookStock(
  bookId: string,
  warehouse_collection: Collection<WarehouseBook>
): Promise<number> {
  const result = await warehouse_collection
    .aggregate([
      { $match: { bookId } },
      { $group: { _id: '$bookId', total: { $sum: '$quantity' } } },
    ])
    .toArray();
  return result[0]?.total || 0;
}

export async function getAllBookStocks(
  warehouse_collection: Collection<WarehouseBook>
): Promise<Record<string, number>> {
  const result = await warehouse_collection
    .aggregate([{ $group: { _id: '$bookId', total: { $sum: '$quantity' } } }])
    .toArray();
  return Object.fromEntries(result.map((r) => [r._id, r.total]));
}

export async function placeBooksOnShelf(
  bookId: string,
  shelf: string,
  numberOfBooks: number,
  warehouse_collection: Collection<WarehouseBook>
): Promise<void> {
  await warehouse_collection.updateOne(
    { bookId, shelf },
    { $inc: { quantity: numberOfBooks } },
    { upsert: true }
  );
}

export async function findBookOnShelf(
  bookId: string,
  warehouse_collection: Collection<WarehouseBook>
): Promise<Array<{ shelf: string; quantity: number }>> {
  const shelves = await warehouse_collection.find({ bookId }).toArray();
  return shelves.map((shelf) => ({
    shelf: shelf.shelf,
    quantity: shelf.quantity,
  }));
}

if (import.meta.vitest !== undefined) {
  const { describe, it, expect, afterAll, beforeEach } = import.meta.vitest;
  let bookDatabase: BookDatabaseAccessor;
  let warehouse_collection: Collection<WarehouseBook>;

  describe('warehouse service', () => {
    beforeEach(async () => {
      bookDatabase = getBookDatabase();
      warehouse_collection = bookDatabase.warehouse_collection;
    });

    afterAll(async () => {
      await cleanupDatabase(bookDatabase);
    });

    describe('getBookStock', () => {
      it('returns total stock for a book across all shelves', async () => {
        const bookId = new ObjectId().toString();

        await warehouse_collection.insertMany([
          { bookId, shelf: 'A1', quantity: 5 },
          { bookId, shelf: 'B2', quantity: 3 },
        ]);

        const totalStock = await getBookStock(bookId, warehouse_collection);
        expect(totalStock).toBe(8);
      });

      it('returns 0 for non-existent book', async () => {
        const nonExistentBookId = new ObjectId().toString();
        const totalStock = await getBookStock(
          nonExistentBookId,
          warehouse_collection
        );
        expect(totalStock).toBe(0);
      });
    });

    describe('getAllBookStocks', () => {
      it('returns stock levels for all books', async () => {
        const book1 = new ObjectId().toString();
        const book2 = new ObjectId().toString();

        await warehouse_collection.insertMany([
          { bookId: book1, shelf: 'A1', quantity: 5 },
          { bookId: book1, shelf: 'B2', quantity: 3 },
          { bookId: book2, shelf: 'C3', quantity: 2 },
        ]);

        const allStocks = await getAllBookStocks(warehouse_collection);
        expect(allStocks).toEqual({
          [book1]: 8,
          [book2]: 2,
        });
      });

      it('returns empty object when warehouse is empty', async () => {
        const allStocks = await getAllBookStocks(warehouse_collection);
        expect(allStocks).toEqual({});
      });
    });

    describe('placeBooksOnShelf', () => {
      it('adds books to a new shelf', async () => {
        const bookId = new ObjectId().toString();
        const shelf = 'A1';
        const quantity = 5;

        await placeBooksOnShelf(bookId, shelf, quantity, warehouse_collection);

        const result = await warehouse_collection.findOne({ bookId, shelf });
        expect(result).toMatchObject({
          bookId,
          shelf,
          quantity,
        });
      });

      it('increases quantity when adding to existing shelf', async () => {
        const bookId = new ObjectId().toString();
        const shelf = 'A1';

        await placeBooksOnShelf(bookId, shelf, 5, warehouse_collection);
        await placeBooksOnShelf(bookId, shelf, 3, warehouse_collection);

        const result = await warehouse_collection.findOne({ bookId, shelf });
        expect(result?.quantity).toBe(8);
      });
    });

    describe('findBookOnShelf', () => {
      it('returns all shelves containing the book', async () => {
        const bookId = new ObjectId().toString();

        await warehouse_collection.insertMany([
          { bookId, shelf: 'A1', quantity: 5 },
          { bookId, shelf: 'B2', quantity: 3 },
        ]);

        const shelves = await findBookOnShelf(bookId, warehouse_collection);
        expect(shelves).toEqual([
          { shelf: 'A1', quantity: 5 },
          { shelf: 'B2', quantity: 3 },
        ]);
      });

      it('returns empty array for non-existent book', async () => {
        const nonExistentBookId = new ObjectId().toString();
        const shelves = await findBookOnShelf(
          nonExistentBookId,
          warehouse_collection
        );
        expect(shelves).toEqual([]);
      });
    });
  });
}
