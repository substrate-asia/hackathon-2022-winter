/* eslint-disable */
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint",
        "react-hooks"
    ],
    "rules": {
        'indent': [2, 4, {'SwitchCase': 1}],
        'semi': [2, 'always'],
        'semi-spacing': 2,
        'keyword-spacing': 2,
        'key-spacing': [2, {beforeColon: false, afterColon: true}],
        'object-curly-spacing': [2, 'never', {
            'objectsInObjects': false,
            'arraysInObjects': false
        }],
        'operator-linebreak': ['error', 'before'],
        'space-before-function-paren': ['error', {'anonymous': 'always', 'named': 'never'}],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'off',
        'react/prop-types': 0,
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        'react/jsx-wrap-multilines': [
            'error',
            {
                declaration: 'parens-new-line',
                assignment: 'parens-new-line',
                return: 'parens-new-line',
                arrow: 'parens-new-line',
                condition: 'parens-new-line',
                logical: 'parens-new-line',
                prop: 'parens-new-line',
            },
        ],
        'quotes': ["error", "single"],
        'react/jsx-max-props-per-line': [
            'error',
            {
                maximum: 2,
                when: 'always',
            },
        ],
        'space-before-function-paren': [
            'error',
            {anonymous: 'always', named: 'never'},
        ],
        'semi-spacing': ['error'],
        'keyword-spacing': ['error'],
        'comma-spacing': ['error'],
        'key-spacing': ['error', {beforeColon: false, afterColon: true}],
        'object-curly-spacing': ['error', 'never'],
        'arrow-spacing': ['error'],
        'array-bracket-spacing': ['error', 'never'],
        'computed-property-spacing': ['error', 'never'],
        'func-call-spacing': ['error', 'never'],
        'switch-colon-spacing': ['error'],
        'space-infix-ops': ['error'],
        '@typescript-eslint/type-annotation-spacing': ['error'],
        'no-multi-spaces': 'error',
        'key-spacing': ["error"]
    }
}
