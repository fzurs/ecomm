import { NextRequest, NextResponse } from "next/server"

/**
 * Optimistic check before rendering (see Next's authentication guide): without
 * Django's session cookie there is nothing to show, so straight to /login,
 * keeping where the user was going. Only the cookie's presence is read: the
 * API validates it (and staff, 2FA, permissions) on every request, and
 * AuthGuard handles a cookie that turns out expired.
 *
 * /login itself isn't redirected home on a cookie: an expired one would loop
 * (here to home, AuthGuard back to /login), and the page checks the session
 * for real.
 */
export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  if (pathname === "/login" || req.cookies.has("sessionid")) {
    return NextResponse.next()
  }

  const login = new URL("/login", req.nextUrl)
  if (pathname !== "/") login.searchParams.set("next", pathname + search)
  return NextResponse.redirect(login)
}

export const config = {
  // Not the API (Django answers it), nor Next's assets and public files.
  matcher: ["/((?!api/|_next/static|_next/image|.*\\.[^/]+$).*)"],
}
