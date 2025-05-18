import z from 'zod';

export const bookSchema = z.object({
  name: z.string(),
  author: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
});

export type Book = z.infer<typeof bookSchema>;

async function listBooks(
  filters?: Array<{ from?: number; to?: number }>
): Promise<Book[]> {
  const params = new URLSearchParams();

  filters?.forEach((filter, index) => {
    if (filter.from !== undefined)
      params.append(`filters[${index}][from]`, filter.from.toString());
    if (filter.to !== undefined)
      params.append(`filters[${index}][to]`, filter.to.toString());
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

const assignment = 'assignment-1';

export default {
  assignment,
  listBooks,
};
