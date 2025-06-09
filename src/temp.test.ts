import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { BookDatabaseAccessor, client, getBookDatabase } from './db';
import { seedDb } from './seed';
import { setup, teardown } from './test/setup';

let databaseAccessor: BookDatabaseAccessor;

beforeAll(async () => {
  await setup();

  databaseAccessor = getBookDatabase();
  await seedDb(databaseAccessor);
});

afterAll(async () => {
  await client.close();
  await teardown();
});

describe('book collection get all', () => {
  it('should get all books', async () => {
    const { book_collection } = databaseAccessor;
    const books = await book_collection.find({}).toArray();

    expect(books).toBeDefined();
    expect(books.length).toBe(7);
    expect(books[0].name).toBe("Giant's Bread");
  });
});
