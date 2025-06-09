import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Book } from '../../adapter/assignment-4';
import { BookDatabaseAccessor, cleanupDatabase, getBookDatabase } from '../db';
import { seedDb } from '../db/seed';

describe('book collection get all', () => {
  let databaseAccessor: BookDatabaseAccessor;

  beforeAll(async () => {
    databaseAccessor = getBookDatabase();
    await seedDb(databaseAccessor);
  });

  afterAll(async () => {
    await cleanupDatabase(databaseAccessor);
  });

  it('should get all books', async () => {
    const { book_collection } = databaseAccessor;
    const books = await book_collection.find({}).toArray();

    expect(books).toBeDefined();
    expect(books.length).toBe(7);
    expect(books[0].name).toBe("Giant's Bread");
  });

  it('should maintain data between tests in same suite', async () => {
    const { book_collection } = databaseAccessor;
    const books = await book_collection.find({}).toArray();

    expect(books.length).toBe(7);
  });
});

describe('book collection with clean state per test', () => {
  let databaseAccessor: BookDatabaseAccessor;

  beforeAll(() => {
    databaseAccessor = getBookDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase(databaseAccessor);
  });

  beforeEach(async () => {
    await cleanupDatabase(databaseAccessor);
    await seedDb(databaseAccessor);
  });

  it('should get all books', async () => {
    const { book_collection } = databaseAccessor;
    const books = await book_collection.find({}).toArray();
    expect(books.length).toBe(7);
  });

  it('should start fresh for each test', async () => {
    const { book_collection } = databaseAccessor;

    const initialBooks = await book_collection.find({}).toArray();
    expect(initialBooks.length).toBe(7);

    await book_collection.insertOne({
      name: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      price: 10,
      image: 'https://placehold.co/600x400/EEE/31343C',
    } as Book);

    const books = await book_collection.find({}).toArray();
    expect(books.length).toBe(8);
  });
});
