import { buttonVariants } from "@workspace/ui/components/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@workspace/ui/components/pagination"
import { cn } from "cn"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { type ProductParams, productsHref } from "@/lib/product-params"

/**
 * Links to the listing's pages, with the rest of its params: each page is a
 * URL of its own, so it's cached and can be shared.
 */
export function ProductPagination({
  pathname,
  params,
  pageCount,
}: {
  pathname: string
  params: ProductParams
  pageCount: number
}) {
  if (pageCount <= 1) return null
  const current = Math.min(Math.max(params.page, 1), pageCount)
  const href = (page: number) => productsHref(pathname, { ...params, page })

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PageLink
            href={href(current - 1)}
            disabled={current === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon />
            <span className="hidden sm:block">Previous</span>
          </PageLink>
        </PaginationItem>
        {pagesAround(current, pageCount).map((page, index) => (
          <PaginationItem key={index}>
            {page === null ? (
              <PaginationEllipsis />
            ) : (
              <PageLink
                href={href(page)}
                isActive={page === current}
                className="w-9 px-0"
              >
                {page}
              </PageLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PageLink
            href={href(current + 1)}
            disabled={current === pageCount}
            aria-label="Go to next page"
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon />
          </PageLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

/**
 * A Next link styled as the pagination's buttons (the ui one is a plain <a>).
 * Disabled (no previous or next page), it's not a link.
 */
function PageLink({
  isActive,
  disabled,
  className,
  href,
  children,
  ...props
}: React.ComponentProps<typeof Link> & {
  isActive?: boolean
  disabled?: boolean
}) {
  const classes = cn(
    buttonVariants({ variant: isActive ? "outline" : "ghost" }),
    className
  )
  if (disabled) {
    return (
      <span
        aria-disabled
        aria-label={props["aria-label"]}
        className={cn(classes, "opacity-50")}
      >
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={classes}
      {...props}
    >
      {children}
    </Link>
  )
}

/** The first and last pages, and the ones next to the current; null is a gap. */
function pagesAround(current: number, pageCount: number) {
  const pages: (number | null)[] = []
  for (let page = 1; page <= pageCount; page++) {
    const near = Math.abs(page - current) <= 1
    if (page === 1 || page === pageCount || near) {
      pages.push(page)
    } else if (pages.at(-1) !== null) {
      pages.push(null)
    }
  }
  return pages
}
