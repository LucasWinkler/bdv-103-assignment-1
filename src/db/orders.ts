import { Collection, Db } from 'mongodb';

import { client } from './index';

import type { Order } from '../../adapter/assignment-4';

export interface OrdersDatabaseAccessor {
  database: Db;
  orders_collection: Collection<Order>;
}

export function getOrdersDatabase(dbName?: string): OrdersDatabaseAccessor {
  const database = client.db(
    dbName ??
      Math.floor(Math.random() * 100000)
        .toPrecision()
        .toString()
  );

  const orders_collection = database.collection<Order>('orders');

  return {
    database,
    orders_collection,
  };
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('Orders Database', () => {
    it('should create an orders database accessor', () => {
      const ordersDb = getOrdersDatabase();
      expect(ordersDb.database).toBeInstanceOf(Db);
      expect(ordersDb.orders_collection).toBeDefined();
      expect(ordersDb.orders_collection.collectionName).toBe('orders');
    });
  });
}
