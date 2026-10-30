import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { redirect } from "next/navigation"
import { GoogleLogin } from "@/components/google-button"
import { getGoogleClientId } from "@/lib/cache"
import { getUser } from "@/lib/dal"
import { safeNext } from "@/lib/navigation"
import { SignupForm } from "./_components/signup-form"

export const metadata = { title: "Sign up" }

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  const { next } = await searchParams
  if (await getUser()) {
    redirect(safeNext(typeof next === "string" ? next : null))
  }
  const googleClientId = await getGoogleClientId()

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>Sign up with your email</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm>
          {googleClientId && <GoogleLogin clientId={googleClientId} />}
        </SignupForm>
      </CardContent>
    </Card>
  )
}
