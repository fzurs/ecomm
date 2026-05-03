import baseConfig from "./base.js";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "packages/ui/src/styles/globals.css",
  "tailwindFunctions": ["cn", "cva"]
};

export default config;