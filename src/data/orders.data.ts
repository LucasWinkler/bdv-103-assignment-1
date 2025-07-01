import { BookDatabaseAccessor } from '../db';
import * as ordersService from '../services/orders.service';

export interface OrdersData {
  orderBooks: typeof ordersService.orderBooks;
  listOrders: typeof ordersService.listOrders;
  fulfilOrder: typeof ordersService.fulfilOrder;
}

export function createOrdersData(accessor: BookDatabaseAccessor): OrdersData {
  return {
    orderBooks: (bookIds) =>
      ordersService.orderBooks(bookIds, accessor.orders_collection),

    listOrders: () => ordersService.listOrders(accessor.orders_collection),

    fulfilOrder: (orderId, booksFulfilled) =>
      ordersService.fulfilOrder(
        orderId,
        booksFulfilled,
        accessor.orders_collection,
        accessor.warehouse_collection
      ),
  };
}

export async function getDefaultOrdersDatabase(
  name?: string
): Promise<OrdersData> {
  const { getBookDatabase } = await import('../db');
  const db = getBookDatabase(name);
  return createOrdersData(db);
}
