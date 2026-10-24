"use client"

import { useParams } from "next/navigation"
import { AssistantView } from "../_components/assistant-view"

export default function AssistantConversationPage() {
  const id = Number(useParams<{ id: string }>().id)
  return <AssistantView conversation={id} />
}
