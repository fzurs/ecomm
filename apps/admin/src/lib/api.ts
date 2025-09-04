import { env } from "@/env";
import axios from "axios";
import Cookies from "js-cookie";

import { AuthApi, CategoriesApi, ProductsApi } from "@workspace/typescript-axios-client";

export const api = axios.create({
  baseURL: env.API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  config.headers["X-CSRFToken"] = Cookies.get("csrftoken");
  return config;
});

export const productsApi = new ProductsApi(undefined, undefined, api);

export const categoriesApi = new CategoriesApi(undefined, undefined, api);

export const authApi = new AuthApi(undefined, undefined, api);
