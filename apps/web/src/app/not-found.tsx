import { NotFoundMessage } from "@/components/not-found-message"

export const metadata = { title: "Page not found" }

/** A URL that matches no page: on its own, without the shop's layout. */
export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <NotFoundMessage />
    </main>
  )
}
