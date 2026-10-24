"use client"

import { usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import { AssistantSheet } from "./assistant-sheet"
import { useAssistantChat } from "./use-assistant-chat"

type AssistantContextValue = ReturnType<typeof useAssistantChat> & {
  isOpen: boolean
  setOpen: (open: boolean) => void
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
 * Holds the assistant's panel and conversation, so they survive closing the
 * panel and moving between pages. ⌘J / Ctrl+J toggles it.
 */
export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const chat = useAssistantChat()
  const [isOpen, setOpen] = useState(false)
  // The assistant page shows the same conversation: no panel on top of it.
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
      value={{ ...chat, isOpen: isOpen && !isAssistantPage, setOpen }}
    >
      {children}
      <AssistantSheet />
    </AssistantContext.Provider>
  )
}
