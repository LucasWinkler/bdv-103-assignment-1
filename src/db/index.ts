import { Db, MongoClient } from 'mongodb';

const uri = ((global as unknown as { MONGO_URI: string }).MONGO_URI ??
  'mongodb://mongo') as string;
export const client = new MongoClient(uri);

export async function cleanupDatabase(database: Db) {
  await database.dropDatabase();
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('MongoDB Client', () => {
    it('should create a MongoDB client', () => {
      expect(client).toBeInstanceOf(MongoClient);
      expect(client.options.hosts).toBeDefined();
    });
  });
}
