import { Collection, Db } from 'mongodb';

import { client } from './index';

import type { WarehouseBook } from '../../adapter/assignment-4';

export interface WarehouseDatabaseAccessor {
  database: Db;
  warehouse_collection: Collection<WarehouseBook>;
}

export function getWarehouseDatabase(
  dbName?: string
): WarehouseDatabaseAccessor {
  const database = client.db(
    dbName ??
      Math.floor(Math.random() * 100000)
        .toPrecision()
        .toString()
  );

  const warehouse_collection = database.collection<WarehouseBook>('warehouse');

  return {
    database,
    warehouse_collection,
  };
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('Warehouse Database', () => {
    it('should create a warehouse database accessor', () => {
      const warehouseDb = getWarehouseDatabase();
      expect(warehouseDb.database).toBeInstanceOf(Db);
      expect(warehouseDb.warehouse_collection).toBeDefined();
      expect(warehouseDb.warehouse_collection.collectionName).toBe('warehouse');
    });
  });
}
