import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ChartLineIcon,
  HomeIcon,
  NotepadText,
  Package2,
  ScrollText,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";

const data = [
  { title: "Pedidos", url: "#", icon: <Package2 /> },
  { title: "Productos", url: "/products", icon: <Tag /> },
  { title: "Inventario", url: "/inventory", icon: <NotepadText /> },
  { title: "Clientes", url: "#", icon: <Users /> },
  {
    title: "Informes y estadísticas",
    url: "#",
    icon: <ChartLineIcon />,
  },
  { title: "Facturacion", url: "#", icon: <ScrollText /> },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <HomeIcon className="!size-5" />
                <span className="text-base font-semibold">
                  Ecommerce example
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {data.map((item) => (
              <SidebarMenu key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      {item.icon} {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
