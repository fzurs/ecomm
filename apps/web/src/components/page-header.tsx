"use client"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { SidebarIcon } from "lucide-react"
import React, { Suspense } from "react"
import { SearchForm, SearchFormSkeleton } from "./search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import Link from "next/link"
import { UserNav } from "./user-nav"

/**
 * The header of the shop's pages. Without `breadcrumbs` it's the one shown
 * while a page loads (the layout's fallback).
 */
export function PageHeader({
  breadcrumbs,
  listsProducts = false,
}: {
  breadcrumbs?: { items?: { href: string; title: string }[]; page: string }
  /** The page lists products: the search filters them as the customer types. */
  listsProducts?: boolean
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs?.items?.map(({ title, href }, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={href} />}>
                    {title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            ))}
            <BreadcrumbItem>
              {breadcrumbs ? (
                <BreadcrumbPage>{breadcrumbs.page}</BreadcrumbPage>
              ) : (
                <Skeleton className="h-4 w-32" />
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<SearchFormSkeleton />}>
            <SearchForm live={listsProducts} />
          </Suspense>
          <UserNav />
        </div>
      </div>
    </header>
  )
}
