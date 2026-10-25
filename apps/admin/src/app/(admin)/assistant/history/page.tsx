"use client"

import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { AssistantConversations } from "@/components/assistant/assistant-conversations"
import { useRouter } from "next/navigation"

// A static segment: it takes precedence over [id].
export default function AssistantHistoryPage() {
  const router = useRouter()

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Assistant", href: "/assistant" }]}
          page="History"
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <AssistantConversations
          // A bit wider than the chat's column (max-w-2xl).
          className="mx-auto w-full max-w-3xl"
          listClassName="p-0"
          selected={null}
          onSelect={(id) => router.push(`/assistant/${id}`)}
        />
      </main>
    </>
  )
}
