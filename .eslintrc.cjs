module.exports = {
  extends: [
    'semistandard',
    'plugin:react/recommended',
  ],
  "rules": {
    "semi": ['error', 'never'],
    "space-before-function-paren": ['error', 'never'],
    "react/prop-types": 0,
    "no-case-declarations": 0,
    "no-unused-vars": 1,
    "no-extend-native": 0,
  },
  "env": {
    "webextensions": true
  }
};
