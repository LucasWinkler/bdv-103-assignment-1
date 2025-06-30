import { describe, expect, it } from 'vitest';

import { Configuration, DefaultApi } from '../client';
import { setupTestServer } from './startServer';

import type { TestContext } from './startServer';

setupTestServer();

describe('Hello API', () => {
  it<TestContext>('should return greeting with provided name', async (context) => {
    const client = new DefaultApi(
      new Configuration({ basePath: context.address })
    );
    const name = 'World';
    const response = await client.getHello({ name });

    expect(response.message).toBe(`Hello ${name}`);
  });
});
