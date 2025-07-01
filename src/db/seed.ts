import { fileURLToPath } from 'url';

import { BookDatabaseAccessor, getBookDatabase } from './books';
import { books } from './booksSeedData';

export async function seedDb(bookAccessor?: BookDatabaseAccessor) {
  console.log('Starting seeding');

  try {
    const { database, book_collection } =
      bookAccessor ?? getBookDatabase('bdv-103-books');

    console.log('Deleting collections');
    await database.dropDatabase();

    console.log('Inserting collections');
    const bookResults = await book_collection.insertMany(books);

    console.log('Seeding completed successfully');

    return { bookAccessor, books: bookResults.insertedIds };
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDb();
}
