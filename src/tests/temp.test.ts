import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { BookDatabaseAccessor, client, getBookDatabase } from '../db';
import { seedDb } from '../db/seed';
import { setup, teardown } from './setup';

let databaseAccessor: BookDatabaseAccessor;

beforeAll(async () => {
  await setup();
  await client.connect();
  databaseAccessor = getBookDatabase();
  await seedDb(databaseAccessor);
}, 30000);

afterAll(async () => {
  await databaseAccessor.database.dropDatabase();
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
