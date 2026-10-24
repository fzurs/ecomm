"use client"

import { useQuery } from "@tanstack/react-query"
import { assistantConversationsListOptions } from "@workspace/api-client/query"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { HistoryIcon, SendIcon, SquareIcon, SquarePenIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AssistantMarkdown } from "./assistant-markdown"
import { useAssistant } from "./assistant-provider"

export function AssistantSheet() {
  const { isOpen, setOpen, reset } = useAssistant()
  const [view, setView] = useState<"chat" | "history">("chat")

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="gap-0 p-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="flex-row items-center gap-1 border-b pr-12">
          <div className="mr-auto">
            <SheetTitle>Assistant</SheetTitle>
            <SheetDescription className="sr-only">
              Ask about orders, products, customers, sales and invoices.
            </SheetDescription>
          </div>
          <Button
            variant={view === "history" ? "secondary" : "ghost"}
            size="icon-sm"
            title="Conversations"
            onClick={() => setView(view === "history" ? "chat" : "history")}
          >
            <HistoryIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="New conversation"
            onClick={() => {
              reset()
              setView("chat")
            }}
          >
            <SquarePenIcon />
          </Button>
        </SheetHeader>
        {view === "history" ? (
          <ConversationList onOpen={() => setView("chat")} />
        ) : (
          <Chat />
        )}
      </SheetContent>
    </Sheet>
  )
}

function ConversationList({ onOpen }: { onOpen: () => void }) {
  const { open, conversation } = useAssistant()
  const { data, isPending } = useQuery(assistantConversationsListOptions())

  if (isPending) {
    return <Spinner className="m-auto" />
  }
  if (!data?.results.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No conversations yet</EmptyTitle>
        </EmptyHeader>
      </Empty>
    )
  }
  return (
    <ScrollArea className="min-h-0 flex-1">
      <ul className="p-2">
        {data.results.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={cn(
                "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-muted",
                item.id === conversation && "bg-muted"
              )}
              onClick={() => {
                open(item.id)
                onOpen()
              }}
            >
              <span className="line-clamp-1 font-medium">
                {item.title || "Untitled"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(item.updated_at, { addSuffix: true })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

function Chat() {
  const { messages, tool, error, isStreaming, send, stop } = useAssistant()
  const pathname = usePathname()
  const [text, setText] = useState("")
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [messages, tool, error])

  const submit = () => {
    const message = text.trim()
    if (!message || isStreaming) return
    setText("")
    send(message, pathname)
  }

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          {!messages.length && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Ask about the store</EmptyTitle>
                <EmptyDescription>
                  Orders, products, customers, sales and invoices. It knows the
                  page you&apos;re on.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {messages.map((message) =>
            message.role === "user" ? (
              <div
                key={message.id}
                className="max-w-[85%] self-end rounded-lg bg-primary px-3 py-2 whitespace-pre-wrap text-primary-foreground"
              >
                {message.text}
              </div>
            ) : (
              <AssistantMarkdown key={message.id}>
                {message.text}
              </AssistantMarkdown>
            )
          )}
          {isStreaming && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner />
              {tool ? `${tool}…` : null}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div ref={end} />
        </div>
      </ScrollArea>
      <form
        className="flex items-end gap-2 border-t p-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="How many orders came in this week?"
          className="max-h-40 min-h-10 resize-none"
          autoFocus
        />
        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={stop}
            title="Stop"
          >
            <SquareIcon />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim()}
            title="Send"
          >
            <SendIcon />
          </Button>
        )}
      </form>
    </>
  )
}
