import { defineConfig } from "@hey-api/openapi-ts"

const plugins = ["@hey-api/client-axios", "zod", "@tanstack/react-query"]

export default defineConfig([
  // The API (drf-spectacular, `pnpm generate:schema`).
  { input: "schema.yml", output: "src", plugins },
  // allauth headless: logging in and out, and 2FA (`manage.py allauth_schema`). Its own client
  // instance, configured like the API's one (apps/admin/src/lib/api-setup.ts).
  { input: "allauth.json", output: "src/allauth", plugins },
])
