import { Book, BookFilter, BookInput } from '../../adapter/assignment-4';
import { BookDatabaseAccessor } from '../db/books';
import { WarehouseDatabaseAccessor } from '../db/warehouse';
import * as booksService from '../services/books.service';

export interface BooksData {
  listBooks: (filters: BookFilter) => Promise<Book[]>;
  getBookById: (id: string) => Promise<Book>;
  createBook: (book: BookInput) => Promise<Book>;
  updateBook: (id: string, updates: Partial<BookInput>) => Promise<Book>;
  deleteBook: (id: string) => Promise<number>;
}

export function createBooksData(
  bookAccessor: BookDatabaseAccessor,
  warehouseAccessor: WarehouseDatabaseAccessor
): BooksData {
  return {
    listBooks: (filters) =>
      booksService.listBooks(
        filters,
        bookAccessor.book_collection,
        warehouseAccessor.warehouse_collection
      ),

    getBookById: (id) =>
      booksService.getBookById(
        id,
        bookAccessor.book_collection,
        warehouseAccessor.warehouse_collection
      ),

    createBook: (book) =>
      booksService.createBook(book, bookAccessor.book_collection),

    updateBook: (id, updates) =>
      booksService.updateBook(
        id,
        updates,
        bookAccessor.book_collection,
        warehouseAccessor.warehouse_collection
      ),

    deleteBook: (id) =>
      booksService.deleteBook(id, bookAccessor.book_collection),
  };
}

export async function getDefaultBooksDatabase(
  name?: string
): Promise<BooksData> {
  const { getBookDatabase } = await import('../db/books');
  const { getWarehouseDatabase } = await import('../db/warehouse');
  const warehouseAccessor = getWarehouseDatabase(name);
  const bookAccessor = getBookDatabase(name);
  return createBooksData(bookAccessor, warehouseAccessor);
}
