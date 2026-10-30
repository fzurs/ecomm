import { cookies, headers } from "next/headers"

/**
 * Django, as this server reaches it. The browser never does: it talks to /api
 * on the store's origin, which next.config.mjs forwards here.
 */
export const API_URL = process.env.API_URL ?? "http://localhost:8000"

/** The options every server-side call to Django takes, with the visitor's cookies. */
type DjangoOptions = { baseURL: string; headers: Record<string, string> }

/**
 * For a read on behalf of the visitor (src/lib/dal.ts): their cookies, so
 * Django sees their session. Only in dynamic code, never under "use cache".
 */
export async function asVisitor(): Promise<DjangoOptions> {
  const cookieStore = await cookies()
  return { baseURL: API_URL, headers: { Cookie: cookieStore.toString() } }
}

/**
 * A write to Django from a Server Action, on behalf of the visitor, through a
 * generated SDK function:
 *
 *   await djangoFetch((options) =>
 *     authUserPartialUpdate({ ...options, body, throwOnError: true })
 *   )
 *
 * Sends what the browser would through /api: the visitor's cookies, the CSRF
 * header (the `csrftoken` cookie's value) and the Origin of the action, which
 * Next already checked and Django checks against FRONTEND_ORIGINS. The cookies
 * Django sets in its answer (a renewed session or token) go to the visitor,
 * also when the call fails.
 */
export async function djangoFetch<T>(
  call: (options: DjangoOptions) => Promise<T>
): Promise<T> {
  const cookieStore = await cookies()
  const origin = (await headers()).get("origin")
  const csrfToken = cookieStore.get("csrftoken")?.value

  const copyCookies = (responseOrError: unknown) => {
    for (const header of setCookieHeaders(responseOrError)) {
      const { name, value, options } = parseSetCookie(header)
      cookieStore.set(name, value, options)
    }
  }

  try {
    const result = await call({
      baseURL: API_URL,
      headers: {
        Cookie: cookieStore.toString(),
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
        ...(origin && { Origin: origin }),
      },
    })
    copyCookies(result)
    return result
  } catch (error) {
    copyCookies(error)
    throw error
  }
}

/** The status and body of a failed call to Django (an axios error), if it answered. */
export function failedResponse(error: unknown) {
  return (error as { response?: { status: number; data: unknown } } | null)
    ?.response
}

/**
 * The Set-Cookie headers of a generated SDK call's response, or of the
 * response inside its error.
 */
function setCookieHeaders(responseOrError: unknown): string[] {
  const response = failedResponse(responseOrError) ?? responseOrError
  const headers = (response as { headers?: Record<string, unknown> } | null)
    ?.headers
  const setCookie = headers?.["set-cookie"]
  return Array.isArray(setCookie) ? setCookie : []
}

/**
 * Django's Set-Cookie, as `cookies().set()` takes it. Its Domain is left out:
 * the cookie belongs to the store's domain, as it does through /api.
 */
function parseSetCookie(header: string) {
  const [pair = "", ...attributes] = header
    .split(";")
    .map((part) => part.trim())
  const separator = pair.indexOf("=")
  const options: {
    path?: string
    maxAge?: number
    expires?: Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: "lax" | "strict" | "none"
  } = {}

  for (const attribute of attributes) {
    const [key = "", value = ""] = attribute.split("=", 2)
    switch (key.toLowerCase()) {
      case "path":
        options.path = value
        break
      case "max-age":
        options.maxAge = Number(value)
        break
      case "expires":
        options.expires = new Date(value)
        break
      case "httponly":
        options.httpOnly = true
        break
      case "secure":
        options.secure = true
        break
      case "samesite":
        options.sameSite = value.toLowerCase() as "lax" | "strict" | "none"
        break
    }
  }

  return {
    name: pair.slice(0, separator),
    value: pair.slice(separator + 1),
    options,
  }
}
