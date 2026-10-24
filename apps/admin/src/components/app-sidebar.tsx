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
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { NavUser } from "./nav-user"
import { useSession } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"

const groups = [
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

  const { user: session } = useSession()

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
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.url === pathname.slice(0, item.url.length)
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
        ))}
      </SidebarContent>
      <SidebarFooter>{session && <NavUser user={session} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
