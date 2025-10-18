import * as api from "@workspace/api-client";
export * from "@workspace/api-client";
import globalAxios from "axios";
import Cookies from "js-cookie";

export const axios = globalAxios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axios.interceptors.request.use(async (config) => {
  const isServer = typeof window === "undefined";

  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    config.headers["Cookie"] = cookieStore;
  } else {
    config.headers["X-CSRFToken"] = Cookies.get("csrftoken");
  }

  return config;
});

export const products = new api.ProductsApi(...[, , axios]);
export const categories = new api.CategoriesApi(...[, , axios]);
export const auth = new api.AuthApi(...[, , axios]);
