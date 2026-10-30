import { NotFoundMessage } from "@/components/not-found-message"

export const metadata = { title: "Page not found" }

/** A category, brand or product that doesn't exist (or isn't for sale). */
export default function ShopNotFound() {
  return <NotFoundMessage />
}
