import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import React from "react"
import { AssistantTrigger } from "./assistant/assistant-trigger"
import { NavBreadcrumb } from "./nav-breadcrumb"

// Every page renders its own header, so the assistant's button goes here to show up on all of
// them. AppHeaderNav takes the full width, which keeps it and AppHeaderActions on the right.
function AppHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-5 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) lg:px-6",
        className
      )}
      {...props}
    >
      {children}
      <AssistantTrigger />
    </header>
  )
}

function AppHeaderContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-4 w-full min-w-0 items-center gap-1 **:data-[slot=sidebar-trigger]:-ml-1",
        className
      )}
      {...props}
    />
  )
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
      className={cn("ml-2 flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  )
}

function AppHeaderNav({
  ...props
}: React.ComponentProps<typeof NavBreadcrumb>) {
  return (
    <AppHeaderContent>
      <SidebarTrigger />
      <AppHeaderSeparator />
      <NavBreadcrumb {...props} />
    </AppHeaderContent>
  )
}

export {
  AppHeader,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderActions,
  AppHeaderNav,
}
