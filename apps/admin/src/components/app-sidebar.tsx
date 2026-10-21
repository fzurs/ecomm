"use client"

import {
  BadgeIcon,
  ClipboardListIcon,
  FileTextIcon,
  PackageIcon,
  TagsIcon,
  UsersRoundIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { IconInnerShadowTop } from "@tabler/icons-react"
import Link from "next/link"
import { NavUser } from "./nav-user"
import { useQuery } from "@tanstack/react-query"
import { authUserRetrieveOptions } from "@workspace/api-client/query"
import { usePathname } from "next/navigation"

const items = [
  {
    title: "Customers",
    url: "/customers",
    icon: UsersRoundIcon,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ClipboardListIcon,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileTextIcon,
  },
  {
    title: "Products",
    url: "/products",
    icon: PackageIcon,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: TagsIcon,
  },
  {
    title: "Brands",
    url: "/brands",
    icon: BadgeIcon,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  const { data: session } = useQuery(authUserRetrieveOptions())

  return (
    <Sidebar>
      <SidebarHeader className="h-(--header-height) border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />}>
              <IconInnerShadowTop />
              <span className="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.url === pathname.slice(0, item.url.length)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{session && <NavUser user={session} />}</SidebarFooter>
    </Sidebar>
  )
}
