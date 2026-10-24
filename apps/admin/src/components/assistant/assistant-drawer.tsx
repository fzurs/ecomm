"use client"

import { useQuery } from "@tanstack/react-query"
import { assistantConversationsListOptions } from "@workspace/api-client/query"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Separator } from "@workspace/ui/components/separator"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { HistoryIcon, Maximize2Icon, SquarePenIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { AssistantChat } from "./assistant-chat"
import { AssistantConversations } from "./assistant-conversations"
import { useAssistant } from "./assistant-provider"

export function AssistantDrawer() {
  const isMobile = useIsMobile()
  const { isOpen, setOpen, conversation, setConversation } = useAssistant()
  const [view, setView] = useState<"chat" | "history">("chat")
  const { data } = useQuery(assistantConversationsListOptions())
  const title =
    view === "history"
      ? "History"
      : conversation === null
        ? "New conversation"
        : data?.results.find((item) => item.id === conversation)?.title ||
          "Untitled"

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setOpen}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent size="md">
        <DrawerTitle className="sr-only">Assistant</DrawerTitle>
        <DrawerDescription className="sr-only">
          Ask about orders, products, customers, sales and invoices.
        </DrawerDescription>
        <div className="flex h-(--header-height) shrink-0 items-center justify-between gap-4 border-b px-4">
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="shrink-0">Assistant</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate" title={title}>
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex h-4 shrink-0 items-center gap-2 text-muted-foreground">
            <Button
              size="icon-sm"
              variant={view === "history" ? "secondary" : "ghost"}
              title="History"
              onClick={() => setView(view === "history" ? "chat" : "history")}
            >
              <HistoryIcon />
              <span className="sr-only">History</span>
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              title="New conversation"
              onClick={() => {
                setConversation(null)
                setView("chat")
              }}
            >
              <SquarePenIcon />
              <span className="sr-only">New conversation</span>
            </Button>
            <Link
              href={
                conversation === null
                  ? "/assistant"
                  : `/assistant/${conversation}`
              }
              className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
              title="Open in the assistant page"
              // The page shows the conversation: the drawer won't come back
              // when leaving it.
              onClick={() => setOpen(false)}
            >
              <Maximize2Icon />
              <span className="sr-only">Open in the assistant page</span>
            </Link>
            <Separator orientation="vertical" />
            <DrawerClose render={<Button size="icon-sm" variant="ghost" />}>
              <XIcon />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </div>
        </div>
        {view === "history" ? (
          <AssistantConversations
            selected={conversation}
            onSelect={(id) => {
              setConversation(id)
              setView("chat")
            }}
            onDelete={(id) => {
              if (id === conversation) setConversation(null)
            }}
          />
        ) : (
          <AssistantChat
            conversation={conversation}
            onCreate={setConversation}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}
