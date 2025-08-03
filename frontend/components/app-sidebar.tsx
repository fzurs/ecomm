"use client";

import * as React from "react";
import {
  IconChartLine,
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconHome2,
  IconNotebook,
  IconPackage,
  IconPackageExport,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUserShield,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "franco",
    email: "fzursch@gmail.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Inicio",
      url: "/",
      icon: IconHome2,
    },
    {
      title: "Pedidos",
      url: "/orders",
      icon: IconPackageExport,
    },
    {
      title: "Productos",
      url: "/products",
      icon: IconPackage,
    },
    {
      title: "Inventario",
      url: "/inventory",
      icon: IconNotebook,
    },
    {
      title: "Clientes",
      url: "/customers",
      icon: IconUsers,
    },
    {
      title: "Informes y estadísticas",
      url: "/analytics",
      icon: IconChartLine,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconUserShield />
                <span className="text-base font-semibold">Panel del admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
