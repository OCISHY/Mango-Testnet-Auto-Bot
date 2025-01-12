import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node, // Add Node.js globals
        ...globals.browser,
      },
      ecmaVersion: 2021,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn", // Disable warning on unused variables
      "no-undef": "error", // Error on undefined variables
      "no-console": "off", // Allow console statements
      eqeqeq: ["warn", "always"], // Require === and !==
      curly: ["error", "all"], // Require curly braces for all control statements
      semi: ["error", "always"], // Require semicolons
      "linebreak-style": "off", // Disable linebreak-style rule
      "no-useless-catch": "off", // Disable no-useless-catch rule
    },
  },
];
