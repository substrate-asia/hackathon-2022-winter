module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react', 'eslint-plugin-import'],
  globals: {
    process: true,
    require: true
  },
  root: true,
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': [
      'error',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false }
    ],
    'import/order': [
      'error',
      { groups: ['builtin', 'external', 'parent', 'sibling', 'index'] }
    ],
    'jsx-quotes': ['error', 'prefer-double'],
    'no-useless-escape': 'off'
  }
};
