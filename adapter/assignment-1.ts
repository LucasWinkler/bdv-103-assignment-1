import z from 'zod';
import books from './../mcmasteful-book-list.json';

export const bookSchema = z.object({
  name: z.string(),
  author: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
});

export type Book = z.infer<typeof bookSchema>;

// If you have multiple filters, a book matching any of them is a match.
async function listBooks(
  filters?: Array<{ from?: number; to?: number }>
): Promise<Book[]> {
  console.log('filters', filters);
  if (!filters || filters.length === 0) {
    return books; // No filters, return all books
  }
  console.log('running listBooks');
  return books.filter(book =>
    filters.some(
      filter =>
        (filter.from === undefined || book.price >= filter.from) &&
        (filter.to === undefined || book.price <= filter.to)
    )
  );
}

const assignment = 'assignment-1';

export default {
  assignment,
  listBooks,
};
