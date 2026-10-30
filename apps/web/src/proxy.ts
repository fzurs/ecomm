import { NextRequest, NextResponse } from "next/server"

/**
 * Optimistic check before rendering (see Next's authentication guide): the
 * account pages need a session, so without Django's session cookie they go
 * straight to /login, keeping where the customer was going. Only the cookie's
 * presence is read: the pages validate it with Django (src/lib/dal.ts), and
 * send an expired one to /login too.
 */
export default function proxy(req: NextRequest) {
  if (req.cookies.has("sessionid")) return NextResponse.next()

  const { pathname, search } = req.nextUrl
  const login = new URL("/login", req.nextUrl)
  login.searchParams.set("next", pathname + search)
  return NextResponse.redirect(login)
}

export const config = {
  // The checkout joins them in phase 4 (docs/architecture/auth.md).
  matcher: ["/account/:path*"],
}
