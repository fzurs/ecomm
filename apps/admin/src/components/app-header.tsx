import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import React from "react"

function AppHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) lg:gap-2 lg:px-6",
        className
      )}
      {...props}
    />
  )
}

function AppHeaderContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full items-center gap-1", className)}
      {...props}
    />
  )
}

function AppHeaderSidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof SidebarTrigger>) {
  return <SidebarTrigger className={cn("-ml-1", className)} {...props} />
}

function AppHeaderSeparator({
  orientation = "vertical",
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={cn("mx-2 data-[orientation=vertical]:h-4", className)}
      orientation={orientation}
      {...props}
    />
  )
}

function AppHeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("ml-auto flex items-center gap-2", className)}
      {...props}
    />
  )
}

function AppHeaderBackLink({
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Button size="sm" variant="ghost" asChild>
      <Link {...props}>
        <ChevronLeftIcon />
        {children}
      </Link>
    </Button>
  )
}

export {
  AppHeader,
  AppHeaderContent,
  AppHeaderSidebarTrigger,
  AppHeaderSeparator,
  AppHeaderActions,
  AppHeaderBackLink,
}
