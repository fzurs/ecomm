import { client } from "@workspace/api-client/client"
import { csrfHeader } from "@/lib/csrf"

// Same origin: next.config.mjs forwards /api to Django, so the session and
// CSRF cookies are this app's own.
client.setConfig({ baseURL: "/api" })

client.instance.interceptors.request.use((config) => {
  config.headers.set(csrfHeader())
  return config
})
