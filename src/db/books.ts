import { Collection, Db } from 'mongodb';

import { client } from './index';

import type { BookInput } from '../../adapter/assignment-4';

export interface BookDatabaseAccessor {
  database: Db;
  book_collection: Collection<BookInput>;
}

export function getBookDatabase(dbName?: string): BookDatabaseAccessor {
  const database = client.db(
    dbName ??
      Math.floor(Math.random() * 100000)
        .toPrecision()
        .toString()
  );

  const book_collection = database.collection<BookInput>('books');

  return {
    database,
    book_collection,
  };
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('Books Database', () => {
    it('should create a books database accessor', () => {
      const bookDb = getBookDatabase();
      expect(bookDb.database).toBeInstanceOf(Db);
      expect(bookDb.book_collection).toBeDefined();
      expect(bookDb.book_collection.collectionName).toBe('books');
    });
  });
}
