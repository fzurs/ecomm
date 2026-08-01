import { client } from "@workspace/api-client/client"
import Cookies from "js-cookie"

client.setConfig({
  baseURL: "http://localhost:8000",
  withCredentials: true,
})

client.instance.interceptors.request.use((config) => {
  config.headers["X-CSRFToken"] = Cookies.get("csrftoken")
  return config
})
