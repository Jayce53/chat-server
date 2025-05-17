import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

const config = [
  {languageOptions: {globals: globals.browser}},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "name" : "My rules",
    "rules": {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars"                    : [
        "error",
        {
          vars              : "all",
          args              : "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern : "^_", // Ignore arguments starting with "_"
        },
      ],
    },
  },
  {
    files          : ["src/**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tseslint.parser,

      // parserOptions: {
      //
      // },
      parserOptions: {
        project: "./tsconfig.json",
      },
      ecmaVersion  : "latest",
      sourceType   : "module",
      globals      : {
        ...globals.node,
        ...globals.es2017,
      },
      // globals: {
      //     // Automatically defines common browser globals like 'window', 'document', etc.
      //     window: 'readonly',
      //     document: 'readonly',
      //     console: 'readonly',
      // },

    },
  },
];
// console.log(config);
export default config;
