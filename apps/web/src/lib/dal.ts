import { authUserRetrieve, type UserDetails } from "@workspace/api-client"
import { cookies } from "next/headers"
import { cache } from "react"
import { asVisitor, failedResponse } from "@/lib/django"

/**
 * The visitor's account, read on the server with their cookies: Django
 * validates the session on every request. Cached per request with React's
 * `cache()` (the header and the page share one call), never across requests.
 *
 * It reads cookies, so it only runs in the dynamic parts of a page, inside a
 * <Suspense> (cacheComponents); the catalog around them stays cached.
 */
export const getUser = cache(async (): Promise<UserDetails | null> => {
  // Without the cookie there's no session to ask Django about.
  if (!(await cookies()).has("sessionid")) return null

  try {
    const { data } = await authUserRetrieve({
      ...(await asVisitor()),
      throwOnError: true,
    })
    return data
  } catch (error) {
    // DRF answers 403 without a session (an expired cookie).
    const status = failedResponse(error)?.status
    if (status === 401 || status === 403) return null
    throw error
  }
})

/** What the header shows of the visitor: no more than it needs. */
export type Visitor = { name: string; email: string }

export async function getVisitor(): Promise<Visitor | null> {
  const user = await getUser()
  if (!user) return null
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ")
  return { name: name || user.email || user.username, email: user.email }
}
