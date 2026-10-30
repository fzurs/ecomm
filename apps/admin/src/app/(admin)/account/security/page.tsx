"use client"

import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { TwoFactorSettings } from "@/components/two-factor"
import { useSession } from "@/hooks/use-auth"

export default function SecurityPage() {
  // AuthGuard renders this page only with a session.
  const { user } = useSession()

  return (
    <>
      <AppHeader>
        <AppHeaderNav page="Security" />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="typeset">
            <h1>Security</h1>
            <h2>Two-factor authentication</h2>
          </div>
          {user && <TwoFactorSettings />}
        </div>
      </main>
    </>
  )
}
