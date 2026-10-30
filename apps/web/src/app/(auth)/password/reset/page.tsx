import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { PasswordRequestForm } from "./_components/password-request-form"

export const metadata = { title: "Reset your password" }

export default function PasswordRequestPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot your password?</CardTitle>
        <CardDescription>
          We&apos;ll send you a link to choose a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordRequestForm />
      </CardContent>
    </Card>
  )
}
