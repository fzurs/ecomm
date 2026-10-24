"use client"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { SendIcon, SquareIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AssistantMarkdown } from "./assistant-markdown"
import { useAssistant } from "./assistant-provider"

/**
 * The open conversation and the message box. `contentClassName` sizes the
 * column of messages and the box (the page centers them in a narrower one).
 */
export function AssistantChat({
  contentClassName,
}: {
  contentClassName?: string
}) {
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
        <div className={cn("flex flex-col gap-4 p-4", contentClassName)}>
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
      <div className="border-t">
        <form
          className={cn("flex w-full items-end gap-2 p-4", contentClassName)}
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
      </div>
    </>
  )
}
