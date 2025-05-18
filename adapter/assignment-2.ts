import z from 'zod';
import assignment1 from './assignment-1';

export const bookSchema = z.object({
  id: z.string(),
  name: z.string(),
  author: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
});

export const bookFilterSchema = z
  .array(
    z
      .object({
        from: z.coerce.number().optional(),
        to: z.coerce.number().optional(),
      })
      .strict()
  )
  .optional();

export const createBookSchema = bookSchema.omit({
  id: true,
});

export const updateBookSchema = bookSchema;

export type Book = z.infer<typeof bookSchema>;

async function listBooks(
  filters?: Array<{ from?: number; to?: number }>
): Promise<Book[]> {
  const books = (await assignment1.listBooks(filters)) as Book[];
  return books;
}

async function createOrUpdateBook(book: Book): Promise<Book['id']> {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (book.id) {
    const response = await fetch(`http://localhost:3000/books/${book.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(book),
    });

    if (!response.ok) {
      throw new Error(`Failed to update book: ${response.statusText}`);
    }
    console.log('response from adapter', response);
    const updatedBook = (await response.json()) as Book;
    return updatedBook.id;
  }

  const response = await fetch('http://localhost:3000/books', {
    method: 'POST',
    headers,
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error(`Failed to create book: ${response.statusText}`);
  }

  const createdBook = (await response.json()) as Book;
  return createdBook.id;
}

async function removeBook(book: Book['id']): Promise<void> {
  const response = await fetch(`http://localhost:3000/books/${book}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete book: ${response.statusText}`);
  }

  return;
}

const assignment = 'assignment-2';

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
};
