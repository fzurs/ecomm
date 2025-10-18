import { env } from "@/env";
import axios from "axios";
import Cookies from "js-cookie";

import { AuthApi, CategoriesApi, ProductsApi } from "@workspace/api-client";

export const api = axios.create({
  baseURL: env.API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
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

export const productsApi = new ProductsApi(...[, , api]);
export const categoriesApi = new CategoriesApi(...[, , api]);
export const authApi = new AuthApi(...[, , api]);
