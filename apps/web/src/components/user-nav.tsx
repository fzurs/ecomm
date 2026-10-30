"use client"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { LogOutIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { VisitorContext } from "@/components/visitor-provider"
import { useLogout } from "@/hooks/use-logout"
import { withNext } from "@/lib/navigation"

/** The header's account menu, or "Sign in". The only part waiting for the session. */
export function UserNav() {
  return (
    <React.Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
      <UserMenu />
    </React.Suspense>
  )
}

function UserMenu() {
  const visitorPromise = React.useContext(VisitorContext)
  const visitor = visitorPromise ? React.use(visitorPromise) : null
  const pathname = usePathname()
  const { logOut, pending } = useLogout()

  if (!visitor) {
    return (
      <Link
        href={withNext("/login", pathname)}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Sign in
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Account"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback>{visitor.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="truncate font-medium text-foreground">
              {visitor.name}
            </div>
            <div className="truncate text-xs">{visitor.email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account" />}>
          <UserIcon />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logOut} disabled={pending}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
