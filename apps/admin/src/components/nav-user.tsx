"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UserDetails } from "@workspace/api-client"
import { authLogoutCreateMutation } from "@workspace/api-client/query"

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { ModeToggle } from "@workspace/ui/components/mode-toggle"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { EllipsisVerticalIcon, LogOutIcon } from "lucide-react"

export function NavUser({ user }: { user: UserDetails }) {
  const { isMobile } = useSidebar()

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    ...authLogoutCreateMutation(),
    onSuccess: () => queryClient.invalidateQueries(),
  })

  const handleLogout = () => mutate({})

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user.first_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-left text-sm leading-tight font-medium">
                {user.first_name || user.email || user.username}
              </span>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup className="flex items-center gap-2">
              <DropdownMenuLabel className="text-muted-foreground">
                {user.email || user.username}
              </DropdownMenuLabel>
              <ModeToggle size="icon-sm" className="ml-auto" />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
