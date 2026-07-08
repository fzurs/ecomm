import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "schema.yml",
  output: "src",
  plugins: [
    "@hey-api/client-axios",
    "zod",
    "@tanstack/react-query"
  ],
})
