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
      <main className="flex h-[calc(100svh-var(--header-height))] min-h-0 flex-col">
        <AssistantConversations
          className="mx-auto w-full max-w-2xl"
          selected={null}
          onSelect={(id) => router.push(`/assistant/${id}`)}
        />
      </main>
    </>
  )
}
