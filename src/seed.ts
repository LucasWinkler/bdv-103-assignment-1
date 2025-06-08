import { MongoClient } from 'mongodb';

import { books } from './books';

const uri = process.env.MONGO_URI ?? 'mongodb://mongo:27017';
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('bdv-103-bookstore');
    const bookCollection = db.collection('books');

    await bookCollection.deleteMany({});
    console.log('Collections Deleted');

    const bookResult = await bookCollection.insertMany(books);

    console.log('Books Created:', await bookCollection.countDocuments());

    console.log('Seeding completed successfully');
    return bookResult;
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
