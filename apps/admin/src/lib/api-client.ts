import axios, { AxiosRequestConfig } from "axios"
import { createApiClient } from "@workspace/api-client"
import Cookies from "js-cookie"

const axiosConfig: AxiosRequestConfig = {
  paramsSerializer: { indexes: null },
}

export const api = axios.create({
  ...axiosConfig,
  baseURL: "http://localhost:8000",
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
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

export const apiClient = createApiClient("http://localhost:8000", {
  axiosConfig: axiosConfig,
  axiosInstance: api,
  validate: "response",
})
