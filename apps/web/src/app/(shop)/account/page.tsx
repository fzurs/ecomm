import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { getUser } from "@/lib/dal"
import { withNext } from "@/lib/navigation"
import { PasswordForm } from "./_components/password-form"
import { ProfileForm } from "./_components/profile-form"
import { SignOutButton } from "./_components/sign-out-button"

export const metadata = { title: "Account" }

export default function AccountPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={{ items: [{ title: "Home", href: "/" }], page: "Account" }}
      />
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 lg:p-6">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <AccountDetails />
        </Suspense>
      </div>
    </>
  )
}

async function AccountDetails() {
  const user = await getUser()
  // proxy.ts only saw the cookie: an expired session ends up here.
  if (!user) redirect(withNext("/login", "/account"))

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How we address you.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            firstName={user.first_name ?? ""}
            lastName={user.last_name ?? ""}
            email={user.email}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {user.has_usable_password ? "Password" : "Set a password"}
          </CardTitle>
          <CardDescription>
            {user.has_usable_password
              ? "Change the password you sign in with."
              : "You signed up with Google. Set a password to sign in with your email too."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm hasPassword={user.has_usable_password} />
        </CardContent>
      </Card>
      <SignOutButton />
    </>
  )
}
