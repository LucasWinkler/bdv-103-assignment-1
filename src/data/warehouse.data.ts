import { WarehouseDatabaseAccessor } from '../db/warehouse';
import * as warehouseService from '../services/warehouse.service';

export interface WarehouseData {
  getBookStock: (bookId: string) => Promise<number>;
  getAllBookStocks: () => Promise<Record<string, number>>;
  placeBooksOnShelf: (
    bookId: string,
    shelf: string,
    numberOfBooks: number
  ) => Promise<void>;
  findBookOnShelf: (
    bookId: string
  ) => Promise<Array<{ shelf: string; quantity: number }>>;
}

export function createWarehouseData(
  accessor: WarehouseDatabaseAccessor
): WarehouseData {
  return {
    getBookStock: (bookId) =>
      warehouseService.getBookStock(bookId, accessor.warehouse_collection),

    getAllBookStocks: () =>
      warehouseService.getAllBookStocks(accessor.warehouse_collection),

    placeBooksOnShelf: (bookId, shelf, numberOfBooks) =>
      warehouseService.placeBooksOnShelf(
        bookId,
        shelf,
        numberOfBooks,
        accessor.warehouse_collection
      ),

    findBookOnShelf: (bookId) =>
      warehouseService.findBookOnShelf(bookId, accessor.warehouse_collection),
  };
}

export async function getDefaultWarehouseDatabase(
  name?: string
): Promise<WarehouseData> {
  const { getWarehouseDatabase } = await import('../db/warehouse');
  const warehouseAccessor = getWarehouseDatabase(name);
  return createWarehouseData(warehouseAccessor);
}
