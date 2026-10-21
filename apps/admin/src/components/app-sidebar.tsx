"use client"

import {
  GalleryVerticalEndIcon,
  LayoutGridIcon,
  PackageIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
  TagIcon,
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
    icon: ShoppingCartIcon,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: ReceiptTextIcon,
  },
  {
    title: "Products",
    url: "/products",
    icon: PackageIcon,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: LayoutGridIcon,
  },
  {
    title: "Brands",
    url: "/brands",
    icon: TagIcon,
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
              <GalleryVerticalEndIcon />
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
