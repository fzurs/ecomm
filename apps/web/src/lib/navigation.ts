/**
 * Where to go after logging in: `next`, only if it's a path of this store. Not
 * `//evil.com` or `/\evil.com`, which browsers read as another site.
 */
export function safeNext(next: string | null | undefined, fallback = "/") {
  return next?.startsWith("/") && !/^\/[/\\]/.test(next) ? next : fallback
}

/** `path` keeping where the customer was going (`?next=`), as /login and /signup take it. */
export function withNext(path: string, next: string | null | undefined) {
  return next && next !== "/"
    ? `${path}?next=${encodeURIComponent(next)}`
    : path
}

// The shop's pages with one segment that aren't a category.
const SHOP_PAGES = new Set(["/account", "/brands"])

/**
 * The page lists products (the home, a category, a brand): there the header's
 * search filters them as the customer types.
 */
export function listsProducts(pathname: string) {
  return (
    pathname === "/" ||
    /^\/brands\/[^/]+$/.test(pathname) ||
    (/^\/[^/]+$/.test(pathname) && !SHOP_PAGES.has(pathname))
  )
}
