"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { HistoryIcon, SquarePenIcon } from "lucide-react"
import { useState } from "react"
import { AssistantChat } from "./assistant-chat"
import { AssistantConversations } from "./assistant-conversations"
import { useAssistant } from "./assistant-provider"

export function AssistantSheet() {
  const { isOpen, setOpen, reset, open } = useAssistant()
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
          <AssistantConversations
            onSelect={(id) => {
              open(id)
              setView("chat")
            }}
          />
        ) : (
          <AssistantChat />
        )}
      </SheetContent>
    </Sheet>
  )
}
