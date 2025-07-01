import { afterEach, beforeEach } from 'vitest';

import { createServer } from '../src/server';

import type { AppState } from '../src/types/state';

export type TestContext = {
  address: string;
  close: () => void;
  state: AppState;
};

export async function setupTestServer() {
  beforeEach<TestContext>(async (context) => {
    const { server, state } = await createServer();

    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    context.address = `http://localhost:${port}`;
    context.close = () => server.close();
    context.state = state;
  });

  afterEach<TestContext>((context) => {
    context.close();
  });
}
