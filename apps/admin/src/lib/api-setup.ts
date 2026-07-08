import { client } from "@workspace/api-client/client"
import { CSRFTOKEN_KEY, getCSRFToken } from "./utils"

client.setConfig({
  baseURL: "http://localhost:8000",
  withCredentials: true,
})

client.instance.interceptors.request.use((config) => {
  config.headers[CSRFTOKEN_KEY] = getCSRFToken()
  return config
})
