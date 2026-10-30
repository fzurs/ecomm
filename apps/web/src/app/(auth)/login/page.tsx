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
import { LoginForm } from "./_components/login-form"

export const metadata = { title: "Sign in" }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams
  // Logged in for real (Django says so, not just the cookie): straight on.
  if (await getUser()) {
    redirect(safeNext(typeof next === "string" ? next : null))
  }
  const googleClientId = await getGoogleClientId()

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm>
          {googleClientId && <GoogleLogin clientId={googleClientId} />}
        </LoginForm>
      </CardContent>
    </Card>
  )
}
