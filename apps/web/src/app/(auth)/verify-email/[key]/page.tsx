import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { buttonVariants } from "@workspace/ui/components/button"
import Link from "next/link"
import { decodeKey, getEmailToConfirm } from "@/lib/account-links"
import { ConfirmEmailForm } from "./_components/confirm-email-form"

export const metadata = { title: "Confirm your email" }

/** The link of the signup email (HEADLESS_FRONTEND_URLS in the API). */
export default async function VerifyEmailPage({
  params,
}: PageProps<"/verify-email/[key]">) {
  const key = decodeKey((await params).key)
  const email = await getEmailToConfirm(key)

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Confirm your email</CardTitle>
        <CardDescription>
          {email ?? "This link was already used or expired."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {email ? (
          <ConfirmEmailForm confirmKey={key} />
        ) : (
          // Signing in with an unconfirmed email sends a new link.
          <Link
            href="/login"
            className={buttonVariants({ className: "w-full" })}
          >
            Sign in to get a new link
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
