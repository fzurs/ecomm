import { client } from "@workspace/api-client/client"
import { client as allauthClient } from "@workspace/api-client/allauth/client"
import { csrfHeader } from "@/lib/csrf"

// Same origin: next.config.mjs forwards /api to Django, so the session and
// CSRF cookies are this app's own. allauth (logging in and out, 2FA) is the
// same API, through its own generated client.
for (const instance of [client, allauthClient]) {
  instance.setConfig({ baseURL: "/api" })
  instance.instance.interceptors.request.use((config) => {
    config.headers.set(csrfHeader())
    return config
  })
}
