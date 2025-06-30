import { describe, expect, it } from 'vitest';

import { setupTestServer } from './startServer';

setupTestServer();

describe('Hello', () => {
  it('should return status `200` and message `Hello World`', async () => {
    const response = await fetch('http://localhost:3000/hello/World');
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.message).toBe('Hello World');
  });
});
