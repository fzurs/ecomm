"use client"

import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { AssistantChat } from "@/components/assistant/assistant-chat"
import { useQuery } from "@tanstack/react-query"
import { assistantConversationsListOptions } from "@workspace/api-client/query"
import { buttonVariants } from "@workspace/ui/components/button"
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
          layout="page"
          contentClassName="mx-auto w-full max-w-2xl"
        />
      </main>
    </>
  )
}
