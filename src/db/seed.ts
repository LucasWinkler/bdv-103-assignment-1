import { BookDatabaseAccessor, getBookDatabase } from '.';
import { books } from './books';

export async function seedDb(databaseAccessor?: BookDatabaseAccessor) {
  console.log('Starting seeding');

  try {
    const { database, book_collection } = databaseAccessor ?? getBookDatabase();

    console.log('Dropping database');
    await database.dropDatabase();

    console.log('Inserting collections');
    await book_collection.insertMany(books);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDb();
}
