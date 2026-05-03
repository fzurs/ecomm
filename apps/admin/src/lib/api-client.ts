import { createApiClient } from "@workspace/api-client";

// export const api = axios.create({
//   baseURL: "http://localhost:8000",
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// api.interceptors.request.use(async (config) => {
//   const isServer = typeof window === "undefined";

//   if (isServer) {
//     const { cookies } = await import("next/headers");
//     const cookieStore = await cookies();
//     config.headers["Cookie"] = cookieStore;
//   } else {
//     config.headers["X-CSRFToken"] = Cookies.get("csrftoken");
//   }

//   return config;
// });

export const apiClient = createApiClient("http://localhost:8000", {
  axiosConfig: { paramsSerializer: { indexes: null } },
});
