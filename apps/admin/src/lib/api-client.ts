import { createApiClient } from "@workspace/api-client"
import Cookies from "js-cookie"

export const apiClient = createApiClient("http://localhost:8000", {
  axiosConfig: {
    baseURL: "http://localhost:8000",
    withCredentials: true,
    paramsSerializer: { indexes: null },
  },
  validate: "response",
})

apiClient.axios.interceptors.request.use(async (config) => {
  const isServer = typeof window === "undefined"

  if (isServer) {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    config.headers["Cookie"] = cookieStore
  } else {
    config.headers["X-CSRFToken"] = Cookies.get("csrftoken")
  }

  return config
})
