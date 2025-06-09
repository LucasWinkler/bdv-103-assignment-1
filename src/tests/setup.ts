/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll } from 'vitest';

import { client } from '../db';

beforeAll(async () => {
  console.log('Starting MongoMemoryServer');
  const instance = await MongoMemoryServer.create({
    binary: { version: '7.0.7' },
  });

  while (instance.state === 'new') {
    await instance.start();
  }

  const uri = instance.getUri();

  (global as any).__MONGOINSTANCE = instance;
  (global as any).MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  console.log('MongoMemoryServer setup completed');
});

afterAll(async () => {
  console.log('Starting teardown of MongoMemoryServer');
  const instance = (global as any).__MONGOINSTANCE as MongoMemoryServer;

  if (client) {
    console.log('Closing client');
    await client.close();
  }

  if (instance) {
    console.log('Stopping instance');
    await instance.stop({ doCleanup: true });
  }

  console.log('Teardown of MongoMemoryServer completed');
});
