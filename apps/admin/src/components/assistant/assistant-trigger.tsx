"use client"

import { Button } from "@workspace/ui/components/button"
import { usePathname } from "next/navigation"
import { AssistantIcon } from "./assistant-icon"
import { useAssistant } from "./assistant-provider"

export function AssistantTrigger() {
  const { setOpen } = useAssistant()
  // The assistant page already shows the conversation.
  if (usePathname().startsWith("/assistant")) return null
  return (
    <Button
      variant="ghost"
      size="sm"
      // On mobile only the icon shows, in a square button like icon-sm.
      className="max-sm:w-8 max-sm:px-0"
      onClick={() => setOpen(true)}
      title="Assistant (⌘J)"
    >
      <AssistantIcon />
      <span className="max-sm:sr-only">Assistant</span>
    </Button>
  )
}
