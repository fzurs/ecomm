import baseConfig from "@workspace/prettier-config/base.js"

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  trailingComma: "all",
}

export default config
