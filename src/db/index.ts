/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection, Db, MongoClient } from 'mongodb';

import type {
  BookInput,
  Order,
  WarehouseBook,
} from '../../adapter/assignment-4';

export let client: MongoClient;

function initializeClient(uri: string): MongoClient {
  if (client) {
    return client;
  }
  client = new MongoClient(uri);
  return client;
}

export interface BookDatabaseAccessor {
  database: Db;
  book_collection: Collection<BookInput>;
  warehouse_collection: Collection<WarehouseBook>;
  orders_collection: Collection<Order>;
}

export function getBookDatabase(): BookDatabaseAccessor {
  const uri = ((global as any).MONGO_URI as string) ?? 'mongodb://mongo';
  const mongoClient = initializeClient(uri);

  const dbName =
    (global as any).MONGO_URI !== undefined
      ? Math.floor(Math.random() * 100000).toPrecision()
      : 'bdv-103-bookstore';

  const database = mongoClient.db(dbName);
  const book_collection = database.collection<BookInput>('books');
  const warehouse_collection = database.collection<WarehouseBook>('warehouse');
  const orders_collection = database.collection<Order>('orders');

  return {
    database,
    book_collection,
    warehouse_collection,
    orders_collection,
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

    it('should have warehouse collection', () => {
      const { warehouse_collection } = getBookDatabase();
      expect(warehouse_collection).toBeDefined();
    });

    it('should have orders collection', () => {
      const { orders_collection } = getBookDatabase();
      expect(orders_collection).toBeDefined();
    });
  });
}
