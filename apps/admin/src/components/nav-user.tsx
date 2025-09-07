"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { userDetailsQueryOptions } from "@/lib/queries";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Skeleton } from "./ui/skeleton";

export function NavUser() {
  const router = useRouter();

  const { data: user, isPending, isError } = useQuery(userDetailsQueryOptions);

  const { mutate } = useMutation({
    mutationFn: () => authApi.authLogoutCreate(),
    onError: () => {
      toast.error("Fail to logout.");
    },
    onSuccess: () => {
      toast.success("Successful logout!");
      router.push("/login");
      router.refresh();
    },
  });

  if (isError || isPending) return <Skeleton className="size-8 rounded-full" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src="" alt={user.username} />
          <AvatarFallback className="bg-linear-to-t from-sky-500 to-indigo-500" />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.username}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => mutate()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
