"use client"

import { Button } from "@workspace/ui/components/button"
import { SparklesIcon } from "lucide-react"
import { useAssistant } from "./assistant-provider"

export function AssistantTrigger() {
  const { setOpen } = useAssistant()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setOpen(true)}
      title="Assistant (⌘J)"
    >
      <SparklesIcon />
      <span className="sr-only">Open the assistant</span>
    </Button>
  )
}
