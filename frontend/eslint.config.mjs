// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...tseslint.configs.strict,
  {
    files: ["*.ts"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@angular-eslint/recommended",
      "plugin:@angular-eslint/template/process-inline-templates"
    ],
    ignores: [
      'encore.gen',
      '.encore'
    ],
    ignorePatterns: [
      'projects/**/*'
    ],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          "type": "attribute",
          "prefix": "app",
          "style": "camelCase"
        }
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          "type": "element",
          "prefix": ["app", "template"],
          "style": "kebab-case"
        }
      ]
    }
  },
  {
    "files": ["*.html"],
    "extends": ["plugin:@angular-eslint/template/recommended"],
    "rules": {}
  }
);
