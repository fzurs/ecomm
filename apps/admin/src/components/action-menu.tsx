import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  return <DropdownMenuContent align={align} {...props} />
}

const ActionMenuGroup = DropdownMenuGroup

const ActionMenuItem = DropdownMenuItem

const ActionMenuSeparator = DropdownMenuSeparator

const ActionMenuSub = DropdownMenuSub

const ActionMenuSubContent = DropdownMenuSubContent

const ActionMenuSubTrigger = DropdownMenuSubTrigger

const ActionMenuPortal = DropdownMenuPortal

const ActionMenuRadioGroup = DropdownMenuRadioGroup

const ActionMenuRadioItem = DropdownMenuRadioItem

export {
  ActionMenu,
  ActionMenuTrigger,
  ActionMenuContent,
  ActionMenuGroup,
  ActionMenuItem,
  ActionMenuSeparator,
  ActionMenuSub,
  ActionMenuSubContent,
  ActionMenuSubTrigger,
  ActionMenuPortal,
  ActionMenuRadioGroup,
  ActionMenuRadioItem
}
