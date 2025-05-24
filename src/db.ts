import { Context, Next } from 'koa';
import { Db, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://mongo:27017';
const client = new MongoClient(uri);

let db: Db | undefined = undefined;

export async function connectDb() {
  if (db) {
    return db;
  }

  console.log('Connecting to MongoDB...');
  try {
    await client.connect();
    db = client.db('assignment-3');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  }
}

type ContextWithDb = Context & {
  state: {
    db: Db;
  };
};

export const dbMiddleware = async (ctx: ContextWithDb, next: Next) => {
  if (!db) {
    throw new Error('Database not connected');
  }

  ctx.state.db = db;
  await next();
};
