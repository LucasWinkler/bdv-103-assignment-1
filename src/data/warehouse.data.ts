import { BookDatabaseAccessor } from '../db';
import * as warehouseService from '../services/warehouse.service';

export interface WarehouseData {
  getBookStock: typeof warehouseService.getBookStock;
  getAllBookStocks: typeof warehouseService.getAllBookStocks;
  placeBooksOnShelf: typeof warehouseService.placeBooksOnShelf;
  findBookOnShelf: typeof warehouseService.findBookOnShelf;
}

export function createWarehouseData(
  accessor: BookDatabaseAccessor
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
  const { getBookDatabase } = await import('../db');
  const db = getBookDatabase(name);
  return createWarehouseData(db);
}
