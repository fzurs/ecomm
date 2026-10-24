"use client"

import {
  BotMessageSquareIcon,
  GalleryVerticalEndIcon,
  HouseIcon,
  LayoutGridIcon,
  PackageIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersRoundIcon,
  type LucideIcon,
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

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  // Draws the icon with the highlight gradient.
  highlight?: boolean
}

const groups: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      { title: "Home", url: "/", icon: HouseIcon },
      {
        title: "Assistant",
        url: "/assistant",
        icon: BotMessageSquareIcon,
        highlight: true,
      },
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

const HIGHLIGHT_ID = "sidebar-highlight-gradient"

/**
 * The gradient of the highlighted items' icons. An SVG stroke can't take a
 * CSS gradient, so the icons reference this one by id. userSpaceOnUse spans
 * lucide's 24x24 viewBox; the default units break on straight lines, whose
 * bounding box has no height.
 */
function HighlightGradient() {
  return (
    <svg aria-hidden className="absolute size-0">
      <defs>
        <linearGradient
          id={HIGHLIGHT_ID}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="24"
          y2="0"
        >
          <stop offset="0%" className="[stop-color:var(--color-violet-500)]" />
          {/* SVG blends in sRGB: straight from violet to amber the middle
              turns grayish, so it goes through pink. */}
          <stop offset="50%" className="[stop-color:var(--color-pink-500)]" />
          <stop offset="100%" className="[stop-color:var(--color-amber-400)]" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  const { user } = useSession()

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
                      >
                        <item.icon
                          {...(item.highlight && {
                            stroke: `url(#${HIGHLIGHT_ID})`,
                          })}
                        />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <HighlightGradient />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
