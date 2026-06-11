"use client"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { SidebarIcon } from "lucide-react"
import React, { Suspense } from "react"
import { SearchForm } from "./search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import Link from "next/link"
import { ModeToggle } from "@workspace/ui/components/mode-toggle"

export function PageHeader({
  breadcrumbs,
  children,
}: {
  breadcrumbs?: { items?: { href: string; title: string }[]; page: string }
  children?: React.ReactNode
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        {breadcrumbs && (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {breadcrumbs.items?.map(({ title, href }, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={href}>{title}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </React.Fragment>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbs.page}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        {children}
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Suspense>
            <SearchForm className="w-full sm:ml-auto sm:w-auto" />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

export function PageAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("", className)} />
}
