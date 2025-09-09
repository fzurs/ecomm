import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Login } from "@workspace/api-client";

import { authApi } from "@/lib/api";
import { currentUserQueryOptions } from "@/lib/queries";

export function useUser() {
  const query = useQuery(currentUserQueryOptions);

  return {
    user: query.data,
    isStaff: query.data?.is_staff,
    ...query,
  };
}

export function useLogout() {
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: () => authApi.authLogoutCreate(),
    onError: () => {
      toast.error("Fail to logout.");
    },
    onSuccess: () => {
      toast.success("Successful logout!");
      router.push(
        "/login" + pathname !== "/" ? `?callbackUrl=${pathname}` : "",
      );
      router.refresh();
    },
  });

  return { logout: () => mutation.mutate(), ...mutation };
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const mutation = useMutation({
    mutationFn: (data: Login) => authApi.authLoginCreate({ login: data }),
    onError: () => {
      toast.error("Could not log in");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      router.push(callbackUrl);
      toast.success("Session started!");
    },
  });

  return { login: (data: Login) => mutation.mutate(data), ...mutation };
}
