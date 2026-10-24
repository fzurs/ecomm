"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  assistantConversationsDestroyMutation,
  assistantConversationsListOptions,
  assistantConversationsListQueryKey,
} from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import { Empty, EmptyHeader, EmptyTitle } from "@workspace/ui/components/empty"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Trash2Icon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAssistant } from "./assistant-provider"

/**
 * The user's conversations, newest first. `onSelect` gets the picked one
 * (the page navigates to it; the side panel opens it in place).
 */
export function AssistantConversations({
  onSelect,
  className,
}: {
  onSelect: (id: number) => void
  className?: string
}) {
  const { reset, conversation } = useAssistant()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery(assistantConversationsListOptions())
  const destroy = useMutation({
    ...assistantConversationsDestroyMutation(),
    onSuccess: (_, { path }) => {
      if (path.id === conversation) reset()
      if (pathname === `/assistant/${path.id}`) router.replace("/assistant")
      queryClient.invalidateQueries({
        queryKey: assistantConversationsListQueryKey(),
      })
    },
  })

  if (isPending) {
    return <Spinner className="m-auto" />
  }
  if (!data?.results.length) {
    return (
      <Empty className={className}>
        <EmptyHeader>
          <EmptyTitle>No conversations yet</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }
  return (
    <ScrollArea className={cn("min-h-0 flex-1", className)}>
      <ul className="p-2">
        {data.results.map((item) => (
          <li key={item.id} className="group/conversation relative">
            <button
              type="button"
              className={cn(
                "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 pr-10 text-left hover:bg-muted",
                item.id === conversation && "bg-muted"
              )}
              onClick={() => onSelect(item.id)}
            >
              <span className="line-clamp-1 font-medium">
                {item.title || "Untitled"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(item.updated_at, { addSuffix: true })}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Delete"
              className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover/conversation:opacity-100 focus-visible:opacity-100"
              disabled={destroy.isPending}
              onClick={() => destroy.mutate({ path: { id: item.id } })}
            >
              <Trash2Icon />
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
