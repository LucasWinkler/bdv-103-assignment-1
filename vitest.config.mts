import { defineConfig } from 'vitest/config';

export default defineConfig({
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
