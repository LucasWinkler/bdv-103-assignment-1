import { fileURLToPath } from 'url';

import { BookDatabaseAccessor, getBookDatabase } from '.';
import { books } from './books';

export async function seedDb(databaseAccessor?: BookDatabaseAccessor) {
  console.log('Starting seeding');

  try {
    const { database, book_collection } = databaseAccessor ?? getBookDatabase();

    console.log('Deleting collections');
    await database.dropDatabase();

    console.log('Inserting collections');
    const bookResults = await book_collection.insertMany(books);

    console.log('Seeding completed successfully');

    return { databaseAccessor, books: bookResults.insertedIds };
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDb();
}
