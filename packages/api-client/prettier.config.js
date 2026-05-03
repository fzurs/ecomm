import baseConfig from "@workspace/prettier-config"

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  printWidth: 60,
  trailingComma: "all",
  singleQuote: true,
}

export default config
