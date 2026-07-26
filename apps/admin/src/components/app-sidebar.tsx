"use client"

import {
  ClipboardList,
  PackageIcon,
  StarsIcon,
  TagsIcon,
  UsersIcon,
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
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { IconInnerShadowTop } from "@tabler/icons-react"
import Link from "next/link"
import { NavUser } from "./nav-user"
import { useQuery } from "@tanstack/react-query"
import { authUserRetrieveOptions } from "@workspace/api-client/query"
import { cn } from "@workspace/ui/lib/utils"
import { usePathname } from "next/navigation"

const items = [
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
    icon: StarsIcon,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ClipboardList,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UsersIcon,
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
            <SidebarMenuButton asChild>
              <Link href="/">
                <IconInnerShadowTop />
                <span className="text-base font-semibold">Acme Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={
                      pathname !== "/" &&
                      item.url.includes(pathname.slice(0, item.url.length))
                    }
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{session && <NavUser user={session} />}</SidebarFooter>
    </Sidebar>
  )
}

export function AppSidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof SidebarTrigger>) {
  return <SidebarTrigger {...props} className={cn("-ml-1", className)} />
}
