"use client"

import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { OrderStatus } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { CircleDashedIcon } from "lucide-react"
import { useState } from "react"
import { OrderStatusBadge } from "../../orders/_components/order-status-badge"
import { OrderStatusRadioGroup } from "../../orders/_components/order-status-radio-group"
import { orderStatusOptions } from "../../orders/_lib/order-status"
import {
  PlaygroundSection,
  PlaygroundValue,
} from "../_components/playground-section"

export default function OrderStatusPlaygroundPage() {
  const [status, setStatus] = useState<OrderStatus>("pending")

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Playground", href: "/playground" }]}
          page="Order status"
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-8 px-4 py-6 lg:px-6">
        <PlaygroundSection
          title="OrderStatusBadge"
          description="Every status, in the table and in the order detail."
        >
          {orderStatusOptions.map((option) => (
            <OrderStatusBadge key={option.value} status={option.value} />
          ))}
        </PlaygroundSection>
        <PlaygroundSection
          title="OrderStatusRadioGroup"
          description="Status picker in the row actions submenu and the order detail."
          className="items-center"
        >
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <CircleDashedIcon />
              Change status
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <OrderStatusRadioGroup value={status} onValueChange={setStatus} />
            </DropdownMenuContent>
          </DropdownMenu>
          <OrderStatusBadge status={status} />
          <PlaygroundValue value={status} />
        </PlaygroundSection>
      </main>
    </>
  )
}
