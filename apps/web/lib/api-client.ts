import { createApiClient } from "@workspace/api-client"

export const apiClient = createApiClient("http://localhost:8000", {
  axiosConfig: { paramsSerializer: { indexes: null } },
})
