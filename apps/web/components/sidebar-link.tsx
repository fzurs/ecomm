"use client"
import { SidebarMenuButton } from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

export function SidebarMenuLink({
  href,
  size,
  ...props
}: React.ComponentProps<typeof Link> & {
  size?: React.ComponentProps<typeof SidebarMenuButton>["size"]
}) {
  const pathname = usePathname()

  return (
    <SidebarMenuButton
      isActive={Boolean(href && pathname === href)}
      size={size}
      asChild
    >
      <Link href={href} {...props} />
    </SidebarMenuButton>
  )
}
