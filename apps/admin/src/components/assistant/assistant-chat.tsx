"use client"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Empty, EmptyHeader, EmptyTitle } from "@workspace/ui/components/empty"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@workspace/ui/components/input-group"
import { cn } from "@workspace/ui/lib/utils"
import { SendIcon, SquareIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AssistantMarkdown } from "./assistant-markdown"
import { useAssistant } from "./assistant-provider"

/**
 * The open conversation and the message box. `contentClassName` sizes the
 * column of messages and the box (the page centers them in a narrower one).
 * In the "page" layout the box floats without the top border, and an empty
 * conversation shows it in the middle of the screen, under the empty state.
 */
export function AssistantChat({
  contentClassName,
  layout = "panel",
}: {
  contentClassName?: string
  layout?: "panel" | "page"
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

  const empty = (
    <Empty className={cn(layout === "page" && "flex-none p-0")}>
      <EmptyHeader>
        <EmptyTitle>How can I help you today?</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
  const alert = error && (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
  const form = (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <InputGroup>
        <InputGroupTextarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="How many orders came in this week?"
          className="max-h-40 min-h-10"
          autoFocus
        />
        <InputGroupAddon align="block-end">
          {isStreaming ? (
            <InputGroupButton
              size="icon-sm"
              variant="outline"
              className="ml-auto"
              onClick={stop}
              title="Stop"
            >
              <SquareIcon />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              size="icon-sm"
              variant="default"
              className="ml-auto"
              disabled={!text.trim()}
              title="Send"
            >
              <SendIcon />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  )

  if (layout === "page" && !messages.length) {
    return (
      // The halves around the box are equal, so the box sits in the middle;
      // the bottom padding, as tall as the header above, makes it the middle
      // of the screen rather than of the space under the header.
      <div className="flex flex-1 flex-col px-4 pb-(--header-height)">
        <div
          className={cn(
            "flex flex-1 flex-col justify-end pb-6",
            contentClassName
          )}
        >
          {empty}
        </div>
        <div className={contentClassName}>{form}</div>
        <div className={cn("flex-1 pt-4", contentClassName)}>{alert}</div>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className={cn("flex flex-col gap-4 p-4", contentClassName)}>
          {!messages.length && empty}
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
          {alert}
          <div ref={end} />
        </div>
      </ScrollArea>
      <div className={cn(layout === "panel" && "border-t")}>
        <div
          className={cn("p-4", layout === "page" && "pt-0", contentClassName)}
        >
          {form}
        </div>
      </div>
    </>
  )
}
