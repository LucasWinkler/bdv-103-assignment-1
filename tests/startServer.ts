import { afterEach, beforeEach } from 'vitest';

import { createServer } from '../src/serverLauncher';

import type { Server } from 'http';

export type TestContext = {
  address: string;
  close: () => void;
};

let server: Server;

export function setupTestServer() {
  beforeEach<TestContext>((context) => {
    server = createServer();

    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    context.address = `http://localhost:${port}`;
    context.close = () => server.close();
  });

  afterEach<TestContext>((context) => {
    context.close();
  });
}
