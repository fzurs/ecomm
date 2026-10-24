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
      size="icon-sm"
      onClick={() => setOpen(true)}
      title="Assistant (⌘J)"
    >
      <AssistantIcon />
      <span className="sr-only">Open the assistant</span>
    </Button>
  )
}
