/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection, Db, MongoClient } from 'mongodb';

import type { Book } from '../../adapter/assignment-4';

const uri = ((global as any).MONGO_URI as string) ?? 'mongodb://mongo';
export const client = new MongoClient(uri);

export interface BookDatabaseAccessor {
  database: Db;
  book_collection: Collection<Book>;
}

export function getBookDatabase(): BookDatabaseAccessor {
  // If we aren’t testing, we are creating a random database name
  const database = client.db(
    (global as any).MONGO_URI !== undefined
      ? Math.floor(Math.random() * 100000).toPrecision()
      : 'bdv-103-bookstore'
  );

  const book_collection = database.collection<Book>('books');
  return {
    database,
    book_collection,
  };
}

export async function cleanupDatabase(accessor: BookDatabaseAccessor) {
  await accessor.database.dropDatabase();
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('db connection', () => {
    it('db should be defined', async () => {
      const { database } = getBookDatabase();
      expect(database).toBeDefined();
    });

    it('db should not be the default database', async () => {
      const { database } = getBookDatabase();
      expect(database.databaseName).not.toBe('bdv-103-bookstore');
    });

    it('should have book collection', () => {
      const { book_collection } = getBookDatabase();
      expect(book_collection).toBeDefined();
    });
  });
}
