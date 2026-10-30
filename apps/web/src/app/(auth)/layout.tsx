import { Command } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

/** Login, signup, password reset and email confirmation: a card on its own. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Command className="size-4" />
          </div>
          Acme Store
        </Link>
        {/* The pages read the session, the URL or a key: dynamic. */}
        <Suspense>{children}</Suspense>
      </div>
    </div>
  )
}
