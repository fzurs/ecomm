"use client"

import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { client } from "@workspace/api-client/client"
import {
  assistantConversationsCreateMutation,
  assistantConversationsListQueryKey,
  assistantConversationsRetrieveOptions,
} from "@workspace/api-client/query"
import type { Message, MessageRole } from "@workspace/api-client"
import Cookies from "js-cookie"
import { useMemo, useState, useSyncExternalStore } from "react"
import { sessionQueryKey } from "@/hooks/use-auth"

/** `draft`: shown before the server saves it, while its answer comes in. */
export type ChatMessage = {
  id: string
  role: MessageRole
  text: string
  draft: boolean
}

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

/**
 * A tool the answer called. The stream only says when a call starts, so a step
 * runs until the next event: text or another call ends it.
 */
export type ReplyStep = { name: string; status: "running" | "done" | "error" }

type Reply = {
  isStreaming: boolean
  // The steps of the last answer, kept after it ends to show them under it.
  steps: ReplyStep[]
  error: string | null
  controller?: AbortController
}

const IDLE: Reply = { isStreaming: false, steps: [], error: null }

// The state of each conversation's answer, outside React: an answer keeps
// streaming while the user moves between pages (e.g. /assistant hands over to
// /assistant/{id} right after the first message).
const replies = new Map<number, Reply>()
const listeners = new Set<() => void>()

function setReply(id: number, patch: Partial<Reply>) {
  replies.set(id, { ...(replies.get(id) ?? IDLE), ...patch })
  listeners.forEach((listener) => listener())
}

/** Ends the running steps of the answer, if there are any. */
function settleSteps(id: number, status: ReplyStep["status"]) {
  const steps = replies.get(id)?.steps ?? []
  if (!steps.some((step) => step.status === "running")) return
  setReply(id, {
    steps: steps.map((step) =>
      step.status === "running" ? { ...step, status } : step
    ),
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function useReply(id: number | null) {
  return useSyncExternalStore(
    subscribe,
    () => (id === null ? IDLE : (replies.get(id) ?? IDLE)),
    () => IDLE
  )
}

// Ids for the messages shown before the server saves them.
let draftId = 0

/**
 * Streams the answer to `text` into the conversation's query data: the user's
 * message and the answer show up right away, and the saved ones replace them
 * when it ends.
 */
async function startReply(
  queryClient: QueryClient,
  id: number,
  text: string,
  page: string
) {
  const controller = new AbortController()
  setReply(id, { isStreaming: true, steps: [], error: null, controller })

  const { queryKey } = assistantConversationsRetrieveOptions({ path: { id } })
  const now = new Date().toISOString()
  const answerId = --draftId
  const draft = (role: MessageRole, id: number): Message => ({
    id,
    role,
    text: "",
    created_at: now,
  })
  const update = (change: (messages: Message[]) => Message[]) =>
    queryClient.setQueryData(
      queryKey,
      (current) => current && { ...current, messages: change(current.messages) }
    )
  const append = (delta: string) =>
    update((messages) =>
      messages.map((message) =>
        message.id === answerId
          ? { ...message, text: (message.text ?? "") + delta }
          : message
      )
    )
  // Synchronously, so the chat never renders the conversation without them
  // (a new one is opened right after this call).
  update((messages) => [
    ...messages,
    { ...draft("user", --draftId), text },
    draft("assistant", answerId),
  ])
  // A fetch in flight would drop the drafts. The cancel reverts to the data
  // set above: setQueryData also updates what a cancel reverts to.
  queryClient.cancelQueries({ queryKey })

  try {
    for await (const { event, data } of streamReply(
      id,
      { text, page },
      controller.signal
    )) {
      if (event === "text") {
        settleSteps(id, "done")
        append(data.delta)
      } else if (event === "tool") {
        settleSteps(id, "done")
        setReply(id, {
          steps: [
            ...(replies.get(id)?.steps ?? []),
            { name: data.name, status: "running" },
          ],
        })
        // Text before and after a tool call are separate paragraphs.
        append("\n\n")
      } else if (event === "error") {
        settleSteps(id, "error")
        setReply(id, { error: data.message })
      }
    }
  } catch (caught) {
    // Stopped or failed: a step that was running didn't finish.
    settleSteps(id, "error")
    if (!controller.signal.aborted) {
      if (caught instanceof ReplyError && [401, 403].includes(caught.status)) {
        // Same as the query client: a gone session sends the user to /login.
        queryClient.invalidateQueries({
          queryKey: sessionQueryKey,
          exact: true,
        })
      }
      setReply(id, {
        error:
          caught instanceof Error
            ? caught.message
            : "The assistant couldn't answer. Try again.",
      })
    }
  } finally {
    settleSteps(id, "done")
    setReply(id, { isStreaming: false, controller: undefined })
    // The saved messages replace the drafts. A stopped answer isn't saved, so
    // it stays as it is until the conversation is opened again.
    if (!controller.signal.aborted) queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({
      queryKey: assistantConversationsListQueryKey(),
    })
  }
}

/**
 * A conversation by id (null for a new one): its messages, fetched from the
 * API, plus the answer being streamed. The first message of a new one creates
 * it and passes its id to `onCreate`.
 */
export function useConversation(
  conversation: number | null,
  { onCreate }: { onCreate?: (id: number) => void } = {}
) {
  const queryClient = useQueryClient()
  const reply = useReply(conversation)
  const createConversation = useMutation(assistantConversationsCreateMutation())
  // The first message of a new conversation, shown while it's created. It
  // stays after that: the page shows it until the conversation's URL takes
  // over, and the side panel drops it when its conversation changes.
  const [pending, setPending] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [previous, setPrevious] = useState(conversation)
  if (conversation !== previous) {
    setPrevious(conversation)
    setPending(null)
  }
  const query = useQuery({
    ...assistantConversationsRetrieveOptions({
      path: { id: conversation ?? 0 },
    }),
    // A refetch mid-answer would drop the drafts.
    enabled: conversation !== null && !reply.isStreaming,
    // Fresh whenever it's opened; afterwards only the end of an answer
    // invalidates it (which keeps a stopped answer on screen).
    staleTime: Infinity,
    refetchOnMount: "always",
  })

  const send = async (text: string, page: string) => {
    if (conversation !== null) {
      startReply(queryClient, conversation, text, page)
      return
    }
    setCreateError(null)
    setPending(text)
    try {
      const created = await createConversation.mutateAsync({})
      // So the conversation's page shows the messages without fetching them.
      queryClient.setQueryData(
        assistantConversationsRetrieveOptions({ path: { id: created.id } })
          .queryKey,
        { ...created, messages: [] }
      )
      startReply(queryClient, created.id, text, page)
      onCreate?.(created.id)
    } catch {
      setPending(null)
      setCreateError("The conversation couldn't be created. Try again.")
    }
  }

  // Memoized: a stable array while nothing changes, for the chat's items.
  const data = conversation === null ? undefined : query.data
  const messages = useMemo<ChatMessage[]>(() => {
    if (data) {
      // One message per assistant turn: an answer that calls tools is saved
      // as a message per step, but streams as one, its parts in paragraphs
      // (see `startReply`). Joined, it doesn't change shape when it's saved.
      const turns: ChatMessage[] = []
      for (const message of data.messages) {
        const text = message.text ?? ""
        const last = turns.at(-1)
        if (message.role === "assistant" && last?.role === "assistant") {
          last.text += `\n\n${text}`
        } else {
          turns.push({
            id: String(message.id),
            role: message.role,
            text,
            // Drafts get negative ids (see `startReply`).
            draft: message.id < 0,
          })
        }
      }
      return turns
    }
    // The same two drafts `startReply` adds, so nothing moves when they do.
    return pending === null
      ? []
      : [
          { id: "pending", role: "user", text: pending, draft: true },
          { id: "pending-answer", role: "assistant", text: "", draft: true },
        ]
  }, [data, pending])

  return {
    messages,
    steps: reply.steps,
    error:
      createError ??
      reply.error ??
      (query.isError ? "The conversation couldn't be loaded." : null),
    isLoading: conversation !== null && query.isPending,
    isStreaming: reply.isStreaming || pending !== null,
    send,
    stop: () => reply.controller?.abort(),
  }
}
