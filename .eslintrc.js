module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    'no-control-regex': 0,
    semi: ['error', 'always'],
  },
  globals: {},
};
