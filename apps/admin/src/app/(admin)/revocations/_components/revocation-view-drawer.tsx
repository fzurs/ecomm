import { RevocationRequest } from "@workspace/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { StatusBadge } from "@/components/status"
import { useRowActionDialog } from "@/context/row-actions-provider"
import { useCan } from "@/hooks/use-auth"
import { revocationStatuses } from "../_lib/revocation-status"
import { RevocationActions } from "./revocation-actions"

export function RevocationViewDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<RevocationRequest>("view")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent>
        {row && <RevocationViewDrawerContent key={row.id} row={row} />}
      </DrawerContent>
    </Drawer>
  )
}

const refunds: Record<string, string> = {
  mercadopago: "Refunded with Mercado Pago",
  manual: "To refund by hand: the order has no Mercado Pago payment",
}

function RevocationViewDrawerContent({ row }: { row: RevocationRequest }) {
  // The resolved one replaces the row until the list refetches.
  const [revocation, setRevocation] = useState(row)
  // Approving refunds and credits: the invoicing permission.
  const canResolve = useCan("revocations.add_revocationrequest")
  const { order } = revocation

  const details = [
    {
      label: "Order",
      value: (
        <Link
          href={`/orders/${order.number}`}
          className="underline underline-offset-4"
        >
          {order.number}
        </Link>
      ),
    },
    {
      label: "Customer",
      value: `${order.customer_name} · ${revocation.email}`,
    },
    {
      label: "Requested",
      value: format(revocation.created_at, "MMMM dd, yyyy - p"),
    },
    {
      label: "Delivered",
      value: order.delivered_at
        ? format(order.delivered_at, "MMMM dd, yyyy")
        : "Not yet",
    },
    {
      label: "Revocable until",
      value: revocation.deadline
        ? format(revocation.deadline, "MMMM dd, yyyy - p")
        : "10 days after the delivery",
    },
    { label: "Reason", value: revocation.reason || "—" },
    ...(revocation.status !== "requested"
      ? [
          {
            label: "Resolved",
            value: [
              revocation.resolved_at &&
                format(revocation.resolved_at, "MMMM dd, yyyy - p"),
              revocation.resolved_by,
            ]
              .filter(Boolean)
              .join(" · "),
          },
          ...(revocation.refund
            ? [{ label: "Refund", value: refunds[revocation.refund] }]
            : []),
          ...(revocation.resolution_note
            ? [{ label: "Note", value: revocation.resolution_note }]
            : []),
        ]
      : []),
  ]

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{revocation.code}</DrawerTitle>
        <DrawerDescription>Botón de arrepentimiento</DrawerDescription>
        <div>
          <StatusBadge {...revocationStatuses[revocation.status]} />
        </div>
      </DrawerHeader>
      <div className="flex flex-1 scroll-fade flex-col gap-6 overflow-auto p-4">
        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3 text-sm">
          {details.map(({ label, value }) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="whitespace-pre-line">{value}</dd>
            </div>
          ))}
        </dl>
        {revocation.status === "requested" && canResolve && (
          <RevocationActions
            revocation={revocation}
            onResolved={setRevocation}
          />
        )}
      </div>
      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
      </DrawerFooter>
    </>
  )
}
