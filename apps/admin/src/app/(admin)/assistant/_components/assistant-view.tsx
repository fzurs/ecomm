"use client"

import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import {
  AssistantChat,
  AssistantChatContent,
  AssistantChatEmpty,
  AssistantChatError,
  AssistantChatInput,
  AssistantChatMessages,
  useAssistantChat,
} from "@/components/assistant/assistant-chat"
import { useQuery } from "@tanstack/react-query"
import { assistantConversationsListOptions } from "@workspace/api-client/query"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { HistoryIcon, SquarePenIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/**
 * The assistant's page: the conversation of the URL (null in /assistant, a new
 * one) with the full width. History links to the list of conversations.
 */
export function AssistantView({
  conversation,
}: {
  conversation: number | null
}) {
  const router = useRouter()
  const { data } = useQuery(assistantConversationsListOptions())
  const title = data?.results.find((item) => item.id === conversation)?.title

  return (
    <>
      <AppHeader>
        <AppHeaderNav page={title || "Assistant"} />
        <AppHeaderActions>
          <Link
            href="/assistant/history"
            className={buttonVariants({ size: "icon-sm", variant: "outline" })}
            title="History"
          >
            <HistoryIcon />
            <span className="sr-only">History</span>
          </Link>
          <Link
            href="/assistant"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <SquarePenIcon />
            New conversation
          </Link>
        </AppHeaderActions>
      </AppHeader>
      <main className="flex h-[calc(100svh-var(--header-height))] min-h-0 flex-col">
        <AssistantChat
          // A new chat for each URL: the text being typed doesn't carry over.
          key={conversation ?? "new"}
          conversation={conversation}
          // The new conversation's URL takes over (replace: Back skips the
          // empty /assistant).
          onCreate={(id) => router.replace(`/assistant/${id}`)}
        >
          <AssistantPageChat />
        </AssistantChat>
      </main>
    </>
  )
}

// The column of the page, narrower than the screen.
const column = "mx-auto w-full max-w-2xl"

/**
 * An empty conversation shows the box in the middle of the screen, under the
 * greeting; once it has messages, the box goes to the bottom.
 */
function AssistantPageChat() {
  const { messages, isLoading } = useAssistantChat()

  if (!messages.length && !isLoading) {
    return (
      // The halves around the box are equal, so the box sits in the middle;
      // the bottom padding, as tall as the header above, makes it the middle
      // of the screen rather than of the space under the header.
      <div className="flex flex-1 flex-col px-4 pb-(--header-height)">
        <div className={cn("flex flex-1 flex-col justify-end pb-6", column)}>
          <AssistantChatEmpty className="flex-none p-0" />
        </div>
        <AssistantChatInput className={column} />
        <div className={cn("flex-1 pt-4", column)}>
          <AssistantChatError />
        </div>
      </div>
    )
  }

  return (
    <>
      <AssistantChatMessages>
        <AssistantChatContent className={column} />
      </AssistantChatMessages>
      <AssistantChatInput className={cn("p-4 pt-0", column)} />
    </>
  )
}
