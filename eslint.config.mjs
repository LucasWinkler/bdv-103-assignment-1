import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: ['node_modules', '.prettierignore', 'build'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'import/order': 'off', // Conflicts with prettier import order plugin
      'sort-imports': 'off', // Conflicts with prettier import order plugin
    },
  }
);
