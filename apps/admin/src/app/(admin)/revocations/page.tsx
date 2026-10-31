"use client"

import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { RowActionsProvider } from "@/context/row-actions-provider"
import { RevocationViewDrawer } from "./_components/revocation-view-drawer"
import { RevocationsTable } from "./_components/revocations-table"

/** The store's "botón de arrepentimiento" requests (Res. 424/2020). */
export default function RevocationsPage() {
  return (
    <RowActionsProvider>
      <AppHeader>
        <AppHeaderNav page="Revocations" />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <RevocationsTable />
        <RevocationViewDrawer />
      </main>
    </RowActionsProvider>
  )
}
