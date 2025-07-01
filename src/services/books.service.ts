import { Collection, Filter, ObjectId } from 'mongodb';

import {
  Book,
  BookFilter,
  BookInput,
  WarehouseBook,
} from '../../adapter/assignment-4';
import { cleanupDatabase } from '../db';
import { BookDatabaseAccessor, getBookDatabase } from '../db/books';
import { seedDb } from '../db/seed';
import {
  getWarehouseDatabase,
  WarehouseDatabaseAccessor,
} from '../db/warehouse';
import { getAllBookStocks, getBookStock } from './warehouse.service';

export async function listBooks(
  filters: BookFilter,
  book_collection: Collection<BookInput>,
  warehouse_collection: Collection<WarehouseBook>
): Promise<Book[]> {
  const query: Filter<BookInput> =
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

  const books = await book_collection.find(query).toArray();
  const stocks = await getAllBookStocks(warehouse_collection);

  return books.map((book) => ({
    id: book._id.toString(),
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
    stock: stocks[book._id.toString()] || 0,
  }));
}

export async function getBookById(
  id: string,
  book_collection: Collection<BookInput>,
  warehouse_collection: Collection<WarehouseBook>
): Promise<Book> {
  const book = await book_collection.findOne({ _id: new ObjectId(id) });
  if (!book) {
    throw new Error('Book not found');
  }

  const stock = await getBookStock(id, warehouse_collection);
  return {
    id: book._id.toString(),
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
    stock,
  };
}

export async function createBook(
  book: BookInput,
  book_collection: Collection<BookInput>
): Promise<Book> {
  const result = await book_collection.insertOne({ ...book });
  return { ...book, id: result.insertedId.toString(), stock: 0 };
}

export async function updateBook(
  id: string,
  updates: Partial<BookInput>,
  book_collection: Collection<BookInput>,
  warehouse_collection: Collection<WarehouseBook>
): Promise<Book> {
  const result = await book_collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('Book not found');
  }

  const stock = await getBookStock(id, warehouse_collection);

  return {
    id: result._id.toString(),
    name: result.name,
    author: result.author,
    description: result.description,
    price: result.price,
    image: result.image,
    stock,
  };
}

export async function deleteBook(
  id: string,
  book_collection: Collection<BookInput>
): Promise<number> {
  const result = await book_collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error('Book not found');
  }

  return result.deletedCount;
}

if (import.meta.vitest !== undefined) {
  const { describe, it, expect, beforeAll, afterAll } = import.meta.vitest;
  let bookAccessor: BookDatabaseAccessor;
  let warehouseAccessor: WarehouseDatabaseAccessor;
  let seededBooks: Record<string, ObjectId>;

  describe('books service', () => {
    beforeAll(async () => {
      bookAccessor = getBookDatabase();
      warehouseAccessor = getWarehouseDatabase();
      const { books } = await seedDb(bookAccessor);
      seededBooks = books;
    });

    afterAll(async () => {
      await cleanupDatabase(bookAccessor.database);
    });

    describe('listBooks', () => {
      it('returns all books with their stock levels', async () => {
        const books = await listBooks(
          [],
          bookAccessor.book_collection,
          warehouseAccessor.warehouse_collection
        );
        expect(books).toHaveLength(Object.keys(seededBooks).length);
        expect(books[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          author: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          image: expect.any(String),
          stock: expect.any(Number),
        });
      });

      it('filters books by price range', async () => {
        const books = await listBooks(
          [{ from: 10, to: 20 }],
          bookAccessor.book_collection,
          warehouseAccessor.warehouse_collection
        );
        books.forEach((book) => {
          expect(book.price).toBeGreaterThanOrEqual(10);
          expect(book.price).toBeLessThanOrEqual(20);
        });
      });

      it('filters books by name', async () => {
        const searchTerm = 'Book';
        const books = await listBooks(
          [{ name: searchTerm }],
          bookAccessor.book_collection,
          warehouseAccessor.warehouse_collection
        );
        books.forEach((book) => {
          expect(book.name.toLowerCase()).toContain(searchTerm.toLowerCase());
        });
      });
    });

    describe('getBookById', () => {
      it('returns book details with stock level', async () => {
        const firstBookId = seededBooks[0].toString();
        const book = await getBookById(
          firstBookId,
          bookAccessor.book_collection,
          warehouseAccessor.warehouse_collection
        );
        expect(book).toMatchObject({
          id: firstBookId,
          name: expect.any(String),
          author: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          image: expect.any(String),
          stock: expect.any(Number),
        });
      });

      it('throws error for non-existent book', async () => {
        const nonExistentId = new ObjectId().toString();
        await expect(
          getBookById(
            nonExistentId,
            bookAccessor.book_collection,
            warehouseAccessor.warehouse_collection
          )
        ).rejects.toThrow('Book not found');
      });
    });

    describe('createBook', () => {
      it('creates a new book with zero stock', async () => {
        const newBook = {
          name: 'Test Book',
          price: 10,
          author: 'Test Author',
          description: 'Test Description',
          image: 'Test Image',
        };

        const book = await createBook(newBook, bookAccessor.book_collection);
        expect(book).toMatchObject({
          ...newBook,
          id: expect.any(String),
          stock: 0,
        });
      });
    });

    describe('updateBook', () => {
      it('updates book details', async () => {
        const firstBookId = seededBooks[0].toString();
        const updates = {
          name: 'Updated Book',
          author: 'Updated Author',
          description: 'Updated Description',
          image: 'Updated Image',
          price: 50,
        };

        const book = await updateBook(
          firstBookId,
          updates,
          bookAccessor.book_collection,
          warehouseAccessor.warehouse_collection
        );
        expect(book).toMatchObject({
          id: firstBookId,
          ...updates,
          stock: expect.any(Number),
        });
      });

      it('throws error when updating non-existent book', async () => {
        const nonExistentId = new ObjectId().toString();
        await expect(
          updateBook(
            nonExistentId,
            { name: 'Updated' },
            bookAccessor.book_collection,
            warehouseAccessor.warehouse_collection
          )
        ).rejects.toThrow('Book not found');
      });
    });

    describe('deleteBook', () => {
      it('deletes a book and returns count', async () => {
        const firstBookId = seededBooks[0].toString();
        const result = await deleteBook(
          firstBookId,
          bookAccessor.book_collection
        );
        expect(result).toBe(1);

        await expect(
          getBookById(
            firstBookId,
            bookAccessor.book_collection,
            warehouseAccessor.warehouse_collection
          )
        ).rejects.toThrow('Book not found');
      });

      it('throws error when deleting non-existent book', async () => {
        const nonExistentId = new ObjectId().toString();
        await expect(
          deleteBook(nonExistentId, bookAccessor.book_collection)
        ).rejects.toThrow('Book not found');
      });
    });
  });
}
