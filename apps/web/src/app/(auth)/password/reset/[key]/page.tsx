import { buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import Link from "next/link"
import { decodeKey, isPasswordResetKeyValid } from "@/lib/account-links"
import { PasswordResetForm } from "./_components/password-reset-form"

export const metadata = { title: "Choose a new password" }

/** The link of the password reset email (HEADLESS_FRONTEND_URLS in the API). */
export default async function PasswordResetPage({
  params,
}: PageProps<"/password/reset/[key]">) {
  const key = decodeKey((await params).key)
  const valid = await isPasswordResetKeyValid(key)

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Choose a new password</CardTitle>
        {!valid && (
          <CardDescription>
            This link was already used or expired.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {valid ? (
          <PasswordResetForm resetKey={key} />
        ) : (
          <Link
            href="/password/reset"
            className={buttonVariants({ className: "w-full" })}
          >
            Ask for a new link
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
