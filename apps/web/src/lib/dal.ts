import {
  authUserRetrieve,
  type Cart,
  cartRetrieve,
  type MyOrder,
  myOrdersList,
  myOrdersRetrieve,
  type UserDetails,
} from "@workspace/api-client"
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

const EMPTY_CART: Cart = { items: [], count: 0, total: 0 }

/**
 * The visitor's cart: their account's, or a guest's in their session. Empty
 * without a session cookie (nothing to ask Django about).
 */
export const getCart = cache(async (): Promise<Cart> => {
  if (!(await cookies()).has("sessionid")) return EMPTY_CART
  const { data } = await cartRetrieve({
    ...(await asVisitor()),
    throwOnError: true,
  })
  return data
})

/** The visitor's orders: their account's, and a guest's of this session. */
export const getMyOrders = cache(async (): Promise<MyOrder[]> => {
  if (!(await cookies()).has("sessionid")) return []
  const { data } = await myOrdersList({
    ...(await asVisitor()),
    throwOnError: true,
  })
  return data
})

/** One of the visitor's orders, or null if it isn't theirs (or doesn't exist). */
export const getMyOrder = cache(
  async (number: string): Promise<MyOrder | null> => {
    if (!(await cookies()).has("sessionid")) return null
    try {
      const { data } = await myOrdersRetrieve({
        ...(await asVisitor()),
        path: { number },
        throwOnError: true,
      })
      return data
    } catch (error) {
      if (failedResponse(error)?.status === 404) return null
      throw error
    }
  }
)
