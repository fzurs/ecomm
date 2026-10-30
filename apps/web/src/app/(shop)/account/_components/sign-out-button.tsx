"use client"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { LogOutIcon } from "lucide-react"
import { useLogout } from "@/hooks/use-logout"

export function SignOutButton() {
  const { logOut, pending } = useLogout()
  return (
    <Button variant="outline" onClick={logOut} disabled={pending}>
      {pending ? <Spinner /> : <LogOutIcon />}
      Sign out
    </Button>
  )
}
