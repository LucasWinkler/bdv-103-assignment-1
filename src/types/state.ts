import { BooksData } from '../data/books.data';
import { OrdersData } from '../data/orders.data';
import { WarehouseData } from '../data/warehouse.data';

export interface AppBookDatabaseState {
  books: BooksData;
}

export interface AppWarehouseDatabaseState {
  warehouse: WarehouseData;
}

export interface AppOrdersDatabaseState {
  orders: OrdersData;
}

export type AppState = AppBookDatabaseState &
  AppWarehouseDatabaseState &
  AppOrdersDatabaseState;
