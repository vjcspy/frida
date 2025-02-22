const js = require("@eslint/js");
const ts = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  js.configs.recommended,
  {
    ignores: [],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      globals: {
        console: "readonly",  // 🔥 Định nghĩa `console` để không bị lỗi `no-undef`
        process: "readonly",  // 🔥 Nếu bạn dùng `process.env`
        __dirname: "readonly" // 🔥 Nếu bạn dùng `__dirname`
      }
    },
    plugins: {
      "@typescript-eslint": ts,
      prettier: prettierPlugin
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/explicit-module-boundary-types": "off"
    }
  },
  prettier
];
