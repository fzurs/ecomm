import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import Link from "next/link"
import React from "react"

type NavLink = { label: string; href: string }

/**
 * `parents` are the links leading to the current `page`, in order. It stays on
 * one line: a long `page` is truncated.
 */
function NavBreadcrumb({
  parents = [],
  page,
}: {
  parents?: NavLink[]
  page: string
}) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {parents.map((link) => (
          <React.Fragment key={link.href}>
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbLink render={<Link href={link.href} />}>
                {link.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate" title={page}>
            {page}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { NavBreadcrumb }
