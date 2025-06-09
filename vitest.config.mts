import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    includeSource: ['src/**/*.ts'],
    setupFiles: ['src/test/setup.ts'],
    globals: true,
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
});
