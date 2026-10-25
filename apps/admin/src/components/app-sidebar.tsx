"use client"

import {
  GalleryVerticalEndIcon,
  HouseIcon,
  LayoutGridIcon,
  PackageIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersRoundIcon,
} from "lucide-react"
import type React from "react"

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
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { AssistantIcon } from "./assistant/assistant-icon"
import { NavUser } from "./nav-user"
import { useSession } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType
}

const groups: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      { title: "Home", url: "/", icon: HouseIcon },
      { title: "Assistant", url: "/assistant", icon: AssistantIcon },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/orders", icon: ShoppingCartIcon },
      { title: "Invoices", url: "/invoices", icon: ReceiptTextIcon },
      { title: "Customers", url: "/customers", icon: UsersRoundIcon },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/products", icon: PackageIcon },
      { title: "Categories", url: "/categories", icon: LayoutGridIcon },
      { title: "Brands", url: "/brands", icon: TagIcon },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  // On mobile the sidebar is a sheet over the page, so navigating closes it.
  const { setOpenMobile } = useSidebar()
  const closeMobile = () => setOpenMobile(false)

  const { user } = useSession()

  return (
    <Sidebar>
      <SidebarHeader className="h-(--header-height) border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              onClick={closeMobile}
            >
              <GalleryVerticalEndIcon />
              <span className="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group, index) => (
          <SidebarGroup key={index}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Home is a prefix of every path, so it needs an exact match.
                  const isActive =
                    item.url === "/"
                      ? pathname === "/"
                      : item.url === pathname.slice(0, item.url.length)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.url} />}
                        onClick={closeMobile}
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
        ))}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
