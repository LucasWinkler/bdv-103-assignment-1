import z from 'zod';

import previous_assignment from './assignment-2';

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
        name: z.string().optional(),
        author: z.string().optional(),
      })
      .strict()
  )
  .optional();

export type Book = z.infer<typeof bookSchema>;
export type BookFilter = z.infer<typeof bookFilterSchema>;

// If multiple filters are provided, any book that matches at least one of them should be returned
// Within a single filter, a book would need to match all the given conditions
async function listBooks(filters?: BookFilter): Promise<Book[]> {
  const params = new URLSearchParams();

  filters?.forEach((filter, index) => {
    if (filter.from !== undefined && !isNaN(filter.from))
      params.append(`filters[${index}][from]`, filter.from.toString());
    if (filter.to !== undefined && !isNaN(filter.to))
      params.append(`filters[${index}][to]`, filter.to.toString());
    if (filter.name !== undefined)
      params.append(`filters[${index}][name]`, filter.name);
    if (filter.author !== undefined)
      params.append(`filters[${index}][author]`, filter.author);
  });

  const response = await fetch(
    `http://localhost:3000/books${params.toString() ? `?${params}` : ''}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.statusText}`);
  }

  const books = (await response.json()) as Book[];
  return books;
}

async function createOrUpdateBook(book: Book): Promise<Book['id']> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: Book['id']): Promise<void> {
  await previous_assignment.removeBook(book);
}

const assignment = 'assignment-3';

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
};
