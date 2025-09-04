"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UserDetails } from "@workspace/typescript-axios-client";

import { authApi } from "@/lib/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({ user }: { user: UserDetails }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const queryClient = useQueryClient();

  const avatar = (
    <Avatar className="h-8 w-8 rounded-lg">
      <AvatarImage src="" alt={user.username} />
      <AvatarFallback className="rounded-lg uppercase">
        {user.username.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  );

  const details = (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{user.username}</span>
      <span className="truncate text-xs">{user.email}</span>
    </div>
  );

  const { mutate } = useMutation({
    mutationFn: () => authApi.authLogoutCreate(),
    onError: () => {
      toast.error("Fail to logout.");
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Successful logout!");
      router.push("/login");
    },
  });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {avatar}
              {details}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {avatar}
                {details}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => mutate()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
