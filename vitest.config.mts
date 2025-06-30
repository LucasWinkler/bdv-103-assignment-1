import { defineConfig } from 'vitest/config';

import generateSdkPlugin from './generate-sdk-plugin';

export default defineConfig({
  plugins: [generateSdkPlugin],
  test: {
    includeSource: ['src/**/*.ts'],
    setupFiles: ['src/tests/setup.ts'],
    globals: true,
    hookTimeout: 30000,
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
});
