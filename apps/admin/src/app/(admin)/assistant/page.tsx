"use client"

import { useAssistant } from "@/components/assistant/assistant-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AssistantView } from "./_components/assistant-view"

// A new conversation. Once there's one (the first message created it, or the
// side panel had one open) its URL takes over.
export default function AssistantPage() {
  const router = useRouter()
  const { conversation } = useAssistant()

  useEffect(() => {
    if (conversation !== null) router.replace(`/assistant/${conversation}`)
  }, [conversation, router])

  return <AssistantView />
}
