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
