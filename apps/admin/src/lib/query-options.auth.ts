import { queryOptions } from "@tanstack/react-query";

import { authApi } from "./apis";

export const getUser = () => authApi.authUserRetrieve().then((res) => res.data);

export const userQueryOptions = queryOptions({
  queryKey: ["user"],
  queryFn: getUser,
});
