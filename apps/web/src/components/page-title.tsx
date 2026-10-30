"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { cn } from "cn"
import Link from "next/link"
import * as React from "react"

export type Crumb = { title: string; href: string }

/**
 * A page's breadcrumbs (`crumbs`, then the page's title) and its title.
 * Client only because the ui's breadcrumb renders through a hook.
 */
export function PageTitle({
  title,
  description,
  crumbs = [],
  className,
  children,
}: {
  title: string
  description?: string | null
  crumbs?: Crumb[]
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {crumbs.length > 0 && <Crumbs crumbs={crumbs} page={title} />}
      <h1 className="text-3xl font-bold tracking-tight text-balance">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  )
}

export function Crumbs({ crumbs, page }: { crumbs: Crumb[]; page: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map(({ title, href }) => (
          <React.Fragment key={href}>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={href} />}>
                {title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage className="line-clamp-1">{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
