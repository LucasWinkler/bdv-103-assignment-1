import { Filter, ObjectId } from 'mongodb';

import { Book, BookFilter, BookInput } from '../../adapter/assignment-4';
import { getBookDatabase } from '../db';
import { getAllBookStocks, getBookStock } from './warehouse.service';

export async function listBooks(filters: BookFilter): Promise<Book[]> {
  const { book_collection } = getBookDatabase();
  const query: Filter<BookInput> =
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

  const books = await book_collection.find(query).toArray();
  const stocks = await getAllBookStocks();

  return books.map((book) => ({
    id: book._id.toString(),
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
    stock: stocks[book._id.toString()] || 0,
  }));
}

export async function getBookById(id: string): Promise<Book> {
  const { book_collection } = getBookDatabase();

  const book = await book_collection.findOne({ _id: new ObjectId(id) });
  if (!book) {
    throw new Error('Book not found');
  }

  const stock = await getBookStock(id);
  return {
    id: book._id.toString(),
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
    stock,
  };
}

export async function createBook(book: BookInput): Promise<Book> {
  const { book_collection } = getBookDatabase();
  const result = await book_collection.insertOne({ ...book });
  return { ...book, id: result.insertedId.toString(), stock: 0 };
}

export async function updateBook(
  id: string,
  updates: Partial<BookInput>
): Promise<Book> {
  const { book_collection } = getBookDatabase();
  const mongoResult = await book_collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );

  const value =
    mongoResult && 'value' in mongoResult
      ? (mongoResult as { value?: (BookInput & { _id: ObjectId }) | null })
          .value
      : null;

  if (!value) {
    throw new Error('Book not found');
  }

  const stock = await getBookStock(id);

  return {
    id: value._id.toString(),
    name: value.name,
    author: value.author,
    description: value.description,
    price: value.price,
    image: value.image,
    stock,
  };
}

export async function deleteBook(id: string): Promise<number> {
  const { book_collection } = getBookDatabase();

  const result = await book_collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    throw new Error('Book not found');
  }

  return result.deletedCount;
}
