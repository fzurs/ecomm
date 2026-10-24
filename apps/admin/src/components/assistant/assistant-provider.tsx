"use client"

import { usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import { AssistantDrawer } from "./assistant-drawer"

type AssistantContextValue = {
  isOpen: boolean
  setOpen: (open: boolean) => void
  // The side panel's conversation (null for a new one). The assistant's pages
  // take theirs from the URL instead.
  conversation: number | null
  setConversation: (conversation: number | null) => void
}

const AssistantContext = createContext<AssistantContextValue | null>(null)

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error("useAssistant must be used within an AssistantProvider")
  }
  return context
}

/**
 * Holds the assistant's side panel and its conversation, so they survive
 * closing the panel and moving between pages. ⌘J / Ctrl+J toggles it.
 */
export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [conversation, setConversation] = useState<number | null>(null)
  // The assistant's pages are the chat already: no panel on top of them.
  const isAssistantPage = usePathname().startsWith("/assistant")

  useEffect(() => {
    if (isAssistantPage) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isAssistantPage])

  return (
    <AssistantContext.Provider
      value={{
        isOpen: isOpen && !isAssistantPage,
        setOpen,
        conversation,
        setConversation,
      }}
    >
      {children}
      <AssistantDrawer />
    </AssistantContext.Provider>
  )
}
