import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authApi } from "@/lib/apis";

export function useLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullPath =
    pathname + (searchParams.size > 0 ? `?${searchParams.toString()}` : "");

  const { mutate, isPending } = useMutation({
    mutationFn: () => authApi.authLogoutCreate(),
    onError: () => {
      toast.error("Fail to logout.");
    },
    onSuccess: () => {
      toast.success("Successful logout!");
      router.push(`/login?callbackUrl=${fullPath}`);
      router.refresh();
    },
  });

  return { logout: () => mutate(), isPending };
}
