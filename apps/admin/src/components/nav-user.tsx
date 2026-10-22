"use client"

import { useLogout } from "@/hooks/use-auth"
import { UserDetails } from "@workspace/api-client"

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

  const { mutate } = useLogout()

  const handleLogout = () => mutate({})

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar shape="rounded">
              <AvatarFallback>{user.first_name?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-left text-sm leading-tight font-medium">
              {user.first_name || user.email || user.username}
            </span>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup className="flex items-center gap-2">
              <DropdownMenuLabel className="min-w-0 flex-1 truncate text-muted-foreground">
                {user.email || user.username}
              </DropdownMenuLabel>
              <ModeToggle className="shrink-0" />
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
