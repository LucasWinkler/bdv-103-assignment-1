import { getBookDatabase } from '../db';

export async function getBookStock(bookId: string): Promise<number> {
  const { warehouse_collection } = getBookDatabase();
  const result = await warehouse_collection
    .aggregate([
      { $match: { bookId } },
      { $group: { _id: '$bookId', total: { $sum: '$quantity' } } },
    ])
    .toArray();
  return result[0]?.total || 0;
}

export async function getAllBookStocks(): Promise<Record<string, number>> {
  const { warehouse_collection } = getBookDatabase();
  const result = await warehouse_collection
    .aggregate([{ $group: { _id: '$bookId', total: { $sum: '$quantity' } } }])
    .toArray();
  return Object.fromEntries(result.map((r) => [r._id, r.total]));
}

export async function placeBooksOnShelf(
  bookId: string,
  shelf: string,
  numberOfBooks: number
): Promise<void> {
  const { warehouse_collection } = getBookDatabase();
  await warehouse_collection.updateOne(
    { bookId, shelf },
    { $inc: { quantity: numberOfBooks } },
    { upsert: true }
  );
}

export async function findBookOnShelf(
  bookId: string
): Promise<Array<{ shelf: string; quantity: number }>> {
  const { warehouse_collection } = getBookDatabase();
  const shelves = await warehouse_collection.find({ bookId }).toArray();
  return shelves.map((shelf) => ({
    shelf: shelf.shelf,
    quantity: shelf.quantity,
  }));
}
