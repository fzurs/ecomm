"use client"

import { AssistantView } from "./_components/assistant-view"

// A new conversation: its first message creates it and moves to its URL.
export default function AssistantPage() {
  return <AssistantView conversation={null} />
}
