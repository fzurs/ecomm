"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@workspace/api-client/client"
import {
  assistantConversationsCreateMutation,
  assistantConversationsListQueryKey,
  assistantConversationsRetrieveOptions,
} from "@workspace/api-client/query"
import type { MessageRole } from "@workspace/api-client"
import Cookies from "js-cookie"
import { useCallback, useEffect, useRef, useState } from "react"
import { sessionQueryKey } from "@/hooks/use-auth"

export type ChatMessage = { id: string; role: MessageRole; text: string }

type ReplyEvent =
  | { event: "text"; data: { delta: string } }
  | { event: "tool"; data: { name: string } }
  | { event: "error"; data: { message: string } }
  | { event: "done"; data: { conversation: number } }

/**
 * Posts the message to the reply endpoint and yields its server-sent events.
 * It's a stream the generated axios client can't read, so it uses fetch with
 * the same cookie and CSRF header as `src/lib/api-setup.ts`.
 */
async function* streamReply(
  conversation: number,
  body: { text: string; page: string },
  signal: AbortSignal
): AsyncGenerator<ReplyEvent> {
  const response = await fetch(
    `${client.getConfig().baseURL}/assistant/conversations/${conversation}/reply/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": Cookies.get("csrftoken") ?? "",
      },
      body: JSON.stringify(body),
      signal,
    }
  )
  if (!response.ok || !response.body) {
    const detail = await response
      .json()
      .then((json: { detail?: string }) => json.detail)
      .catch(() => undefined)
    throw new ReplyError(response.status, detail)
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    buffer += value
    const chunks = buffer.split("\n\n")
    buffer = chunks.pop() ?? ""
    for (const chunk of chunks) {
      const fields = Object.fromEntries(
        chunk.split("\n").map((line) => {
          const colon = line.indexOf(": ")
          return [line.slice(0, colon), line.slice(colon + 2)]
        })
      )
      if (!fields.event || !fields.data) continue
      yield { event: fields.event, data: JSON.parse(fields.data) } as ReplyEvent
    }
  }
}

class ReplyError extends Error {
  constructor(
    readonly status: number,
    detail?: string
  ) {
    super(detail ?? "The assistant couldn't answer. Try again.")
  }
}

const TOOL_LABELS: Record<string, string> = {
  search_orders: "Searching orders",
  get_order: "Reading the order",
  search_products: "Searching products",
  search_customers: "Searching customers",
  sales_summary: "Summing up sales",
  list_invoices: "Searching invoices",
}

/**
 * The open conversation: its messages, the answer being streamed and the
 * tool the assistant is running. A new conversation is created on the first
 * message.
 */
export function useAssistantChat() {
  const queryClient = useQueryClient()
  const createConversation = useMutation(assistantConversationsCreateMutation())
  const [conversation, setConversation] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [tool, setTool] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const abort = useRef<AbortController | null>(null)

  const stop = useCallback(() => abort.current?.abort(), [])
  useEffect(() => stop, [stop])

  const reset = useCallback(() => {
    stop()
    setConversation(null)
    setMessages([])
    setError(null)
  }, [stop])

  const open = useCallback(
    async (id: number) => {
      reset()
      setConversation(id)
      let detail
      try {
        detail = await queryClient.fetchQuery({
          ...assistantConversationsRetrieveOptions({ path: { id } }),
          // Always fresh: the cached one misses the messages sent since.
          staleTime: 0,
        })
      } catch {
        // An id from the URL may not exist (or belong to someone else).
        setConversation(null)
        setError("The conversation couldn't be loaded.")
        return
      }
      setMessages(
        detail.messages.map((message) => ({
          id: String(message.id),
          role: message.role,
          text: message.text ?? "",
        }))
      )
    },
    [queryClient, reset]
  )

  const send = useCallback(
    async (text: string, page: string) => {
      const controller = new AbortController()
      abort.current = controller
      const answerId = crypto.randomUUID()
      setError(null)
      setIsStreaming(true)
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "user", text },
        { id: answerId, role: "assistant", text: "" },
      ])
      const append = (delta: string) =>
        setMessages((current) =>
          current.map((message) =>
            message.id === answerId
              ? { ...message, text: message.text + delta }
              : message
          )
        )

      try {
        const id = conversation ?? (await createConversation.mutateAsync({})).id
        setConversation(id)
        for await (const { event, data } of streamReply(
          id,
          { text, page },
          controller.signal
        )) {
          if (event === "text") {
            setTool(null)
            append(data.delta)
          } else if (event === "tool") {
            setTool(TOOL_LABELS[data.name] ?? "Looking it up")
            // Text before and after a tool call are separate paragraphs.
            append("\n\n")
          } else if (event === "error") {
            setError(data.message)
          }
        }
      } catch (caught) {
        if (controller.signal.aborted) return
        if (
          caught instanceof ReplyError &&
          [401, 403].includes(caught.status)
        ) {
          // Same as the query client: a gone session sends the user to /login.
          queryClient.invalidateQueries({
            queryKey: sessionQueryKey,
            exact: true,
          })
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "The assistant couldn't answer. Try again."
        )
      } finally {
        setTool(null)
        setIsStreaming(false)
        // Drops the answer bubble if nothing came back.
        setMessages((current) =>
          current.filter(
            (message) => message.id !== answerId || message.text.trim()
          )
        )
        queryClient.invalidateQueries({
          queryKey: assistantConversationsListQueryKey(),
        })
      }
    },
    [conversation, createConversation, queryClient]
  )

  return {
    conversation,
    messages,
    tool,
    error,
    isStreaming,
    send,
    stop,
    open,
    reset,
  }
}
