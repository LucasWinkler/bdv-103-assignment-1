import { defineConfig } from 'vitest/config';

import generateSdkPlugin from './vitest-openapi-plugin';

export default defineConfig({
  plugins: [generateSdkPlugin],
  test: {
    includeSource: ['src/**/*.ts'],
    setupFiles: ['tests/setup.ts'],
    globals: true,
    hookTimeout: 30000,
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  server: {
    watch: {
      ignored: ['build/**', 'client/**'],
    },
  },
});
