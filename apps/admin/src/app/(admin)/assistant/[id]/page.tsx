"use client"

import { useAssistant } from "@/components/assistant/assistant-provider"
import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { AssistantView } from "../_components/assistant-view"

export default function AssistantConversationPage() {
  const id = Number(useParams<{ id: string }>().id)
  const { conversation, open } = useAssistant()
  const loaded = useRef<number | null>(null)

  // Opens the conversation of the URL, once per id: afterwards the provider
  // owns it (a "New conversation" resets it before leaving the page). It may
  // already be open, e.g. when /assistant redirects here mid-answer.
  useEffect(() => {
    if (loaded.current === id) return
    loaded.current = id
    if (id !== conversation) open(id)
  }, [id, conversation, open])

  return <AssistantView />
}
