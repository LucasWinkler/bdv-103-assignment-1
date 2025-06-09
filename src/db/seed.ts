import { fileURLToPath } from 'url';

import { BookDatabaseAccessor, getBookDatabase } from '.';
import { books } from './books';

export async function seedDb(databaseAccessor?: BookDatabaseAccessor) {
  console.log('Starting seeding');

  try {
    const { book_collection } = databaseAccessor ?? getBookDatabase();

    console.log('Deleting collections');
    await book_collection.deleteMany({});

    console.log('Inserting collections');
    await book_collection.insertMany(books);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDb();
}
