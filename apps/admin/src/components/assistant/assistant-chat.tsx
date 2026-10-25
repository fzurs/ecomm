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
import { cn } from "cn"
import { SendIcon, SquareIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { AssistantMarkdown } from "./assistant-markdown"
import { useConversation } from "./use-conversation"

const AssistantChatContext = createContext<ReturnType<
  typeof useConversation
> | null>(null)

export function useAssistantChat() {
  const context = useContext(AssistantChatContext)
  if (!context) {
    throw new Error("useAssistantChat must be used within an AssistantChat")
  }
  return context
}

/**
 * A conversation (null for a new one, which its first message creates and
 * passes to `onCreate`) for the parts inside it to show. It renders nothing
 * of its own: the side panel and the page compose the parts their own way.
 */
function AssistantChat({
  conversation,
  onCreate,
  children,
}: {
  conversation: number | null
  onCreate?: (id: number) => void
  children: React.ReactNode
}) {
  const chat = useConversation(conversation, { onCreate })
  return (
    <AssistantChatContext.Provider value={chat}>
      {children}
    </AssistantChatContext.Provider>
  )
}

/** The scrolling area of the messages; `AssistantChatContent` goes inside. */
function AssistantChatMessages({
  className,
  ...props
}: React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea
      data-slot="assistant-chat-messages"
      className={cn("min-h-0 flex-1", className)}
      {...props}
    />
  )
}

/**
 * The column of messages: `children` (e.g. `AssistantChatEmpty`), then the
 * messages, the answer's progress and the error. It scrolls to its end as
 * they change.
 */
function AssistantChatContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { messages, tool, error, isLoading, isStreaming } = useAssistantChat()
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [messages, tool, error])

  return (
    <div
      data-slot="assistant-chat-content"
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    >
      {children}
      {isLoading && <Spinner className="mx-auto" />}
      {messages.map((message) =>
        message.role === "user" ? (
          <div
            key={message.id}
            className="max-w-[85%] self-end rounded-lg bg-primary px-3 py-2 whitespace-pre-wrap text-primary-foreground"
          >
            {message.text}
          </div>
        ) : (
          <AssistantMarkdown key={message.id}>{message.text}</AssistantMarkdown>
        )
      )}
      {isStreaming && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner />
          {tool ? `${tool}…` : null}
        </div>
      )}
      <AssistantChatError />
      <div ref={end} />
    </div>
  )
}

/** The greeting of an empty conversation; nothing once it has messages. */
function AssistantChatEmpty({
  className,
  ...props
}: React.ComponentProps<typeof Empty>) {
  const { messages, isLoading } = useAssistantChat()
  if (messages.length || isLoading) return null
  return (
    <Empty data-slot="assistant-chat-empty" className={className} {...props}>
      <EmptyHeader>
        <EmptyTitle>How can I help you today?</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
}

function AssistantChatError({
  className,
  ...props
}: React.ComponentProps<typeof Alert>) {
  const { error } = useAssistantChat()
  if (!error) return null
  return (
    <Alert
      data-slot="assistant-chat-error"
      variant="destructive"
      className={className}
      {...props}
    >
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

/** The message box, with the send button (stop while an answer streams). */
function AssistantChatInput({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit">) {
  const { isStreaming, send, stop } = useAssistantChat()
  const pathname = usePathname()
  const [text, setText] = useState("")

  const submit = () => {
    const message = text.trim()
    if (!message || isStreaming) return
    setText("")
    send(message, pathname)
  }

  return (
    <form
      data-slot="assistant-chat-input"
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      {...props}
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
}

export {
  AssistantChat,
  AssistantChatMessages,
  AssistantChatContent,
  AssistantChatEmpty,
  AssistantChatError,
  AssistantChatInput,
}
