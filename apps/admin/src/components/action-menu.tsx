import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { EllipsisVertical } from "lucide-react"
import React from "react"

const ActionMenu = DropdownMenu

function ActionMenuTrigger({
  children,
  asChild = true,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger asChild={asChild} {...props}>
      {children ?? (
        <Button variant="ghost" size="icon-sm">
          <EllipsisVertical />
          <span className="sr-only">Actions</span>
        </Button>
      )}
    </DropdownMenuTrigger>
  )
}

function ActionMenuContent({
  align = "end",
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return <DropdownMenuContent className="min-w-44" align={align} {...props} />
}

const ActionMenuGroup = DropdownMenuGroup

const ActionMenuItem = DropdownMenuItem

const ActionMenuSeparator = DropdownMenuSeparator

export {
  ActionMenu,
  ActionMenuTrigger,
  ActionMenuContent,
  ActionMenuGroup,
  ActionMenuItem,
  ActionMenuSeparator,
}
