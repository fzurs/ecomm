import { queryOptions } from "@tanstack/react-query";

import { authApi } from "../apis";

export const currentUser = () =>
  authApi.authUserRetrieve().then((res) => res.data);

export const currentUserQueryOptions = queryOptions({
  queryKey: ["current-user"],
  queryFn: currentUser,
});
