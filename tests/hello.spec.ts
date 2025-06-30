import { describe, expect, it } from 'vitest';

import { setupTestServer } from './startServer';

import type { TestContext } from './startServer';

setupTestServer();

describe('Hello', () => {
  it('should return status `200` and message `Hello World`', async (context: TestContext) => {
    const response = await fetch(`${context.address}/hello/World`);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.message).toBe('Hello World');
  });
});
