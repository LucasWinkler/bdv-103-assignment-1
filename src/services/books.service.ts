import { Collection, Filter, ObjectId } from 'mongodb';

import { Book, BookFilter } from '../../adapter/assignment-4';

export async function listBooks(
  filters: BookFilter,
  bookCollection: Collection<Book>
): Promise<Book[]> {
  const query: Filter<Book> =
    filters && filters.length > 0
      ? {
          $or: filters.map((filter) => {
            const conditions: {
              price?: { $gte?: number; $lte?: number };
              name?: { $regex: string; $options: string };
              author?: { $regex: string; $options: string };
            } = {};

            if (
              (filter.from !== undefined && !isNaN(filter.from)) ||
              (filter.to !== undefined && !isNaN(filter.to))
            ) {
              conditions.price = {
                ...(filter.from !== undefined &&
                  !isNaN(filter.from) && { $gte: filter.from }),
                ...(filter.to !== undefined &&
                  !isNaN(filter.to) && { $lte: filter.to }),
              };
            }

            if (filter.name !== undefined) {
              conditions.name = { $regex: filter.name, $options: 'i' };
            }

            if (filter.author !== undefined) {
              conditions.author = { $regex: filter.author, $options: 'i' };
            }

            return conditions;
          }),
        }
      : {};

  const books = await bookCollection.find(query).toArray();

  return books.map((book) => ({
    id: book._id.toString(),
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
  }));
}

export async function createBook(
  book: Omit<Book, 'id'>,
  bookCollection: Collection<Book>
): Promise<Book> {
  const result = await bookCollection.insertOne({
    ...book,
    id: new ObjectId().toString(),
  });
  return { ...book, id: result.insertedId.toString() };
}

export async function updateBook(
  id: string,
  updates: Partial<Omit<Book, 'id'>>,
  bookCollection: Collection<Book>
): Promise<Book> {
  const result = await bookCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { includeResultMetadata: true }
  );

  if (!result.value) {
    throw new Error('Book not found');
  }

  return {
    id: result.value._id.toString(),
    name: result.value.name,
    author: result.value.author,
    description: result.value.description,
    price: result.value.price,
    image: result.value.image,
  };
}

export async function deleteBook(
  id: string,
  bookCollection: Collection<Book>
): Promise<number> {
  const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error('Book not found');
  }

  return result.deletedCount;
}
