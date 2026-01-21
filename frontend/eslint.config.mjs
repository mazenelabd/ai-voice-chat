import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  {
    ignores: [
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/cypress/videos/**",
      "**/cypress/screenshots/**",
      "**/*.config.js",
      "**/jest.setup.*",
      "frontend/**", // Ignore nested frontend directory if it exists
    ],
  },
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/cypress/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-this-alias": "off",
    },
  },
]);

export default eslintConfig;
