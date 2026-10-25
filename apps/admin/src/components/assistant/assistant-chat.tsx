"use client"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Empty, EmptyHeader, EmptyTitle } from "@workspace/ui/components/empty"
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble"
import { Message, MessageContent } from "@workspace/ui/components/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller"
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
import { createContext, useContext, useState } from "react"
import { AssistantMarkdown } from "./assistant-markdown"
import { AssistantSteps } from "./assistant-steps"
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

/**
 * The scrolling area of the messages; `AssistantChatContent` goes inside. It
 * opens at the end, follows the answer while the reader stays at the bottom,
 * and shows a button back to the end once they scroll up.
 */
function AssistantChatMessages({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MessageScroller>) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller
        data-slot="assistant-chat-messages"
        className={cn("flex-1", className)}
        {...props}
      >
        <MessageScrollerViewport>{children}</MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

/**
 * The column of messages, then the error. Each one is an item of the
 * scroller, which measures and anchors them. An empty conversation shows
 * `AssistantChatEmpty` instead of the scroller.
 */
function AssistantChatContent({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerContent>) {
  const { messages, steps, error, isLoading, isStreaming } = useAssistantChat()
  const last = messages.at(-1)

  return (
    <MessageScrollerContent
      data-slot="assistant-chat-content"
      // Screen readers wait for the whole answer instead of reading it as it
      // comes in.
      aria-busy={isStreaming}
      className={cn("gap-6 p-4", className)}
      {...props}
    >
      {isLoading && (
        <MessageScrollerItem>
          <Spinner className="mx-auto" />
        </MessageScrollerItem>
      )}
      {messages.map((message, index) => (
        <MessageScrollerItem
          // By position: the list only grows and the saved messages take the
          // drafts' places, so the answer isn't remounted when it's saved.
          key={index}
          messageId={String(index)}
          // The question just sent settles near the top, with its answer
          // coming in below it. Only until they're saved: the scroller keeps
          // a screen of space under its last anchor, empty below a short or
          // finished answer.
          scrollAnchor={message.role === "user" && message.draft}
        >
          {message.role === "user" ? (
            <Message align="end">
              <MessageContent>
                <Bubble variant="muted" align="end">
                  <BubbleContent className="whitespace-pre-wrap">
                    {message.text}
                  </BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          ) : (
            <Message>
              <MessageContent className="gap-3">
                {/* The steps are the last answer's: older ones aren't kept. */}
                {message === last && (
                  <AssistantSteps
                    steps={steps}
                    thinking={
                      isStreaming &&
                      !message.text.trim() &&
                      !steps.some((step) => step.status === "running")
                    }
                  />
                )}
                {message.text.trim() && (
                  <AssistantMarkdown>{message.text}</AssistantMarkdown>
                )}
              </MessageContent>
            </Message>
          )}
        </MessageScrollerItem>
      ))}
      {error && (
        <MessageScrollerItem>
          <AssistantChatError />
        </MessageScrollerItem>
      )}
    </MessageScrollerContent>
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
            // Not while composing (an IME's Enter confirms the text).
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              submit()
            }
          }}
          aria-label="Message"
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
              <span className="sr-only">Stop</span>
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
              <span className="sr-only">Send</span>
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
