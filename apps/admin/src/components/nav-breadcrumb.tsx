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

type NavItem = { type: "link" | "page"; label: string; href?: string }

const renderNavItem = (item: NavItem) => {
  switch (item.type) {
    case "link":
      return (
        <BreadcrumbLink asChild>
          <Link href={item.href ?? "#"}>{item.label}</Link>
        </BreadcrumbLink>
      )
    case "page":
      return <BreadcrumbPage>{item.label}</BreadcrumbPage>
  }
}

function NavBreadcrumb({ items }: { items: NavItem[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>{renderNavItem(item)}</BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { NavBreadcrumb }
