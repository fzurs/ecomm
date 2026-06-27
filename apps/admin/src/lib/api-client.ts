import { createApiClient } from "@workspace/api-client"
import Cookies from "js-cookie"

export const apiClient = createApiClient("http://localhost:8000", {
  axiosConfig: {
    withCredentials: true,
    paramsSerializer: { indexes: null },
  },
  validate: "response",
})

apiClient.axios.interceptors.request.use(async (config) => {
  config.headers["X-CSRFToken"] = Cookies.get("csrftoken")
  return config
})
