"use client";

import {
  Award,
  ChartBar,
  Layers2,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/nav-main";

import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingBag,
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: ChartBar,
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border border-b h-12">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <LayoutDashboard />
                <span className="text-base font-semibold">Ecommerce Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
