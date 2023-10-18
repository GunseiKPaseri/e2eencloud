import configEsLintJS from '@eslint/js';
import pluginTsEsLint from '@typescript-eslint/eslint-plugin';
import parserTsEsLint from '@typescript-eslint/parser';
import configPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import pluginSonarJS from 'eslint-plugin-sonarjs';
import pluginSortKey from 'eslint-plugin-sort-keys';
import pluginStrictDependencies from 'eslint-plugin-strict-dependencies';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginUnusedImport from 'eslint-plugin-unused-imports';
import pluginVitest from 'eslint-plugin-vitest';
import globals from 'globals';

export default [
  configEsLintJS.configs.recommended,
  configPrettier,
  // TypeScript用の特殊設定
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: parserTsEsLint,
      parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module',
      },
      globals: {
        PublicKeyCredentialRequestOptions: false,
        PublicKeyCredentialCreationOptions: false,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': pluginTsEsLint,
    },
    rules: {
      ...pluginTsEsLint.configs['eslint-recommended'].rules,
      ...pluginTsEsLint.configs['recommended'].rules,
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      // 強化
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // 未使用変数はアンダーバー開始のものを許容
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  // 全体設定
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: parserTsEsLint,
      parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module',
      },
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: [],
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
      sonarjs: pluginSonarJS,
      'sort-keys': pluginSortKey,
      'unused-imports': pluginUnusedImport,
      'strict-dependencies': pluginStrictDependencies,
      vitest: pluginVitest,
      unicorn: pluginUnicorn,
    },
    rules: {
      ...pluginSonarJS.configs['recommended'].rules,
      ...pluginUnicorn.configs['recommended'].rules,
      'sort-keys': 0,
      'sort-keys/sort-keys-fix': 'error',
      'sonarjs/no-small-switch': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-identical-functions': 'off',
      'import/no-default-export': 'off',
      'import/prefer-default-export': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'no-nested-ternary': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/no-unused-prop-types': 'off',
      'react/require-default-props': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off',
      // 'unicorn/filename-case': [
      //   'error',
      //   {
      //     cases: {
      //       camelCase: true,
      //       kebabCase: true,
      //       pascalCase: true,
      //     },
      //     ignore: ['vite-env.d.ts'],
      //   },
      // ],
      'unicorn/no-array-reduce': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/consistent-destructuring': 'off',
      // 後で消す
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/no-await-expression-member': 'off',

      // swc向け https://github.com/ArnaudBarre/eslint-plugin-react-refresh
      'react-refresh/only-export-components': 'error',
      // 依存関係の階層設定
      'strict-dependencies/strict-dependencies': [
        'error',
        [
          {
            module: './src/features/*/thunk',
            allowReferenceFrom: ['./src/features/*'],
            allowSameModule: true,
          },
          {
            module: './src/features/*',
            allowReferenceFrom: ['./src/pages/*'],
            allowSameModule: true,
          },
          {
            module: './src/pages/components/*',
            allowReferenceFrom: ['./src/*.tsx', './src/pages/*'],
            allowSameModule: true,
          },
        ],
        {
          resolveRelativeImport: true,
        },
      ],
      'unused-imports/no-unused-imports': 'error',
    },
  },
];
