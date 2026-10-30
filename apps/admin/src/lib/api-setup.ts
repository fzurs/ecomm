import { client } from "@workspace/api-client/client"
import Cookies from "js-cookie"

// Same origin: next.config.mjs forwards /api to Django, so the session and
// CSRF cookies are this app's own.
client.setConfig({ baseURL: "/api" })

client.instance.interceptors.request.use((config) => {
  config.headers["X-CSRFToken"] = Cookies.get("csrftoken")
  return config
})
