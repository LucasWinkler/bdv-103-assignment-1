/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll } from 'vitest';

import { client, getBookDatabase } from '../db';

beforeAll(async () => {
  const instance = await MongoMemoryServer.create({
    binary: { version: '7.0.7' },
  });

  while (instance.state === 'new') {
    await instance.start();
  }

  const uri = instance.getUri();
  (global as any).__MONGOINSTANCE = instance;
  (global as any).MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  getBookDatabase();
});

afterAll(async () => {
  const instance = (global as any).__MONGOINSTANCE as MongoMemoryServer;

  if (client) {
    await client.close();
  }

  if (instance) {
    await instance.stop({ doCleanup: true });
  }
});
