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

/** `parents` are the links leading to the current `page`, in order. */
function NavBreadcrumb({
  parents = [],
  page,
}: {
  parents?: NavLink[]
  page: string
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parents.map((link) => (
          <React.Fragment key={link.href}>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={link.href} />}>
                {link.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { NavBreadcrumb }
