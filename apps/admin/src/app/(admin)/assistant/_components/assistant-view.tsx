"use client"

import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { AssistantChat } from "@/components/assistant/assistant-chat"
import { AssistantConversations } from "@/components/assistant/assistant-conversations"
import { useAssistant } from "@/components/assistant/assistant-provider"
import { useQuery } from "@tanstack/react-query"
import { assistantConversationsListOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { HistoryIcon, SquarePenIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

/**
 * The assistant's page: the conversation of the AssistantProvider (the same
 * one as the side panel) with the full width. History lists the conversations.
 */
export function AssistantView() {
  const router = useRouter()
  const { reset, conversation } = useAssistant()
  const [isHistoryOpen, setHistoryOpen] = useState(false)
  const { data } = useQuery(assistantConversationsListOptions())
  const title = data?.results.find((item) => item.id === conversation)?.title

  return (
    <>
      <AppHeader>
        <AppHeaderNav page={title || "Assistant"} />
        <AppHeaderActions>
          <Popover open={isHistoryOpen} onOpenChange={setHistoryOpen}>
            <PopoverTrigger render={<Button size="sm" variant="outline" />}>
              <HistoryIcon />
              History
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <AssistantConversations
                className="[&_[data-slot=scroll-area-viewport]]:max-h-96"
                onSelect={(id) => {
                  setHistoryOpen(false)
                  router.push(`/assistant/${id}`)
                }}
              />
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Before navigating: /assistant redirects to an open conversation.
              reset()
              router.push("/assistant")
            }}
          >
            <SquarePenIcon />
            New conversation
          </Button>
        </AppHeaderActions>
      </AppHeader>
      <main className="flex h-[calc(100svh-var(--header-height))] min-h-0 flex-col">
        <AssistantChat contentClassName="mx-auto max-w-3xl" />
      </main>
    </>
  )
}
