import { OrdersDatabaseAccessor } from '../db/orders';
import { WarehouseDatabaseAccessor } from '../db/warehouse';
import * as ordersService from '../services/orders.service';

export interface OrdersData {
  orderBooks: (bookIds: string[]) => Promise<{ orderId: string }>;
  listOrders: () => Promise<
    Array<{ orderId: string; books: Record<string, number> }>
  >;
  fulfilOrder: (
    orderId: string,
    booksFulfilled: Array<{
      book: string;
      shelf: string;
      numberOfBooks: number;
    }>
  ) => Promise<void>;
}

export function createOrdersData(
  ordersAccessor: OrdersDatabaseAccessor,
  warehouseAccessor: WarehouseDatabaseAccessor
): OrdersData {
  return {
    orderBooks: (bookIds) =>
      ordersService.orderBooks(bookIds, ordersAccessor.orders_collection),

    listOrders: () =>
      ordersService.listOrders(ordersAccessor.orders_collection),

    fulfilOrder: (orderId, booksFulfilled) =>
      ordersService.fulfilOrder(
        orderId,
        booksFulfilled,
        ordersAccessor.orders_collection,
        warehouseAccessor.warehouse_collection
      ),
  };
}

export async function getDefaultOrdersDatabase(
  name?: string
): Promise<OrdersData> {
  const { getOrdersDatabase } = await import('../db/orders');
  const { getWarehouseDatabase } = await import('../db/warehouse');
  const ordersAccessor = getOrdersDatabase(name);
  const warehouseAccessor = getWarehouseDatabase(name);
  return createOrdersData(ordersAccessor, warehouseAccessor);
}
