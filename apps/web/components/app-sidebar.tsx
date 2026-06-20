import { Command } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import * as React from "react"
import { apiClient } from "@/lib/api-client"
import { SidebarMenuLink } from "./sidebar-link"

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [categories, brands] = await Promise.all([
    apiClient.categories_list(),
    apiClient.brands_list(),
  ])

  const navMain = [
    {
      title: "Categories",
      items: categories.map((c) => ({ title: c.name, url: `/${c.slug}` })),
    },
    {
      title: "Brands",
      items: brands.map((c) => ({ title: c.name, url: `/brands/${c.slug}` })),
    },
  ]

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Store</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navMain.map(({ title, items }) => (
          <SidebarGroup key={title}>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuLink href={item.url}>
                      {item.title}
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
