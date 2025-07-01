import { BookDatabaseAccessor } from '../db';
import * as booksService from '../services/books.service';

export interface BooksData {
  listBooks: typeof booksService.listBooks;
  getBookById: typeof booksService.getBookById;
  createBook: typeof booksService.createBook;
  updateBook: typeof booksService.updateBook;
  deleteBook: typeof booksService.deleteBook;
}

export function createBooksData(accessor: BookDatabaseAccessor): BooksData {
  return {
    listBooks: (filters) =>
      booksService.listBooks(
        filters,
        accessor.book_collection,
        accessor.warehouse_collection
      ),

    getBookById: (id) =>
      booksService.getBookById(
        id,
        accessor.book_collection,
        accessor.warehouse_collection
      ),

    createBook: (book) =>
      booksService.createBook(book, accessor.book_collection),

    updateBook: (id, updates) =>
      booksService.updateBook(
        id,
        updates,
        accessor.book_collection,
        accessor.warehouse_collection
      ),

    deleteBook: (id) => booksService.deleteBook(id, accessor.book_collection),
  };
}

export async function getDefaultBooksDatabase(
  name?: string
): Promise<BooksData> {
  const { getBookDatabase } = await import('../db');
  const db = getBookDatabase(name);
  return createBooksData(db);
}
