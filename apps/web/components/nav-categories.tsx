"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import * as React from "react"
import { useSidebarItems } from "./sidebar-items-provider"

export function NavCategories() {
  const { categories } = useSidebarItems()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Categories</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {categories.map((category) => (
            <SidebarMenuItem key={category.id}>
              <SidebarMenuButton>{category.name}</SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
