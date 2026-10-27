"use client"
import { useQueryClient } from "@tanstack/react-query"
import { Invoice } from "@workspace/api-client"
import { invoicesRetrieveOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  EllipsisVerticalIcon,
  FileDownIcon,
  FileMinusIcon,
  FilePlusIcon,
  PanelRightIcon,
  RefreshCwIcon,
  SearchCheckIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import { useRowActions } from "@/context/row-actions-provider"
import {
  useEmitInvoice,
  useVerifyInvoice,
} from "../_hooks/use-invoice-mutations"
import { invoicePdfUrl } from "../_lib/invoice-pdf"

export function InvoiceRowActions({ item: invoice }: { item: Invoice }) {
  const { openAction } = useRowActions<Invoice>()
  const queryClient = useQueryClient()
  const emit = useEmitInvoice()
  const verify = useVerifyInvoice()

  const authorized = invoice.status === "authorized"
  const notesAvailable =
    invoice.kind === "invoice" && !invoice.notes_unavailable_reason

  // Warms the detail query the view drawer reads.
  const prefetchDetails = (open: boolean) => {
    if (!open) return
    queryClient.prefetchQuery(
      invoicesRetrieveOptions({ path: { id: invoice.id } })
    )
  }

  return (
    <DropdownMenu onOpenChange={prefetchDetails}>
      <DropdownMenuTrigger
        render={
          <Button size="icon-sm" variant="ghost" aria-label="Open actions" />
        }
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openAction("view", invoice)}>
            <PanelRightIcon />
            View details
          </DropdownMenuItem>
          {authorized && (
            <DropdownMenuItem
              render={
                <a
                  href={invoicePdfUrl(invoice.id)}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <FileDownIcon />
              Open PDF
            </DropdownMenuItem>
          )}
          {notesAvailable && (
            <>
              <DropdownMenuItem
                render={<Link href={`/invoices/${invoice.id}/credit-note`} />}
              >
                <FileMinusIcon />
                Credit note
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/invoices/${invoice.id}/debit-note`} />}
              >
                <FilePlusIcon />
                Debit note
              </DropdownMenuItem>
            </>
          )}
          {invoice.status === "rejected" && (
            <DropdownMenuItem
              disabled={emit.isPending}
              onClick={() => emit.mutate({ path: { id: invoice.id } })}
            >
              <RefreshCwIcon />
              Emit again
            </DropdownMenuItem>
          )}
          {invoice.status === "unverified" && (
            <DropdownMenuItem
              disabled={verify.isPending}
              onClick={() => verify.mutate({ path: { id: invoice.id } })}
            >
              <SearchCheckIcon />
              Verify with ARCA
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {/* Only what ARCA never authorized can go. */}
        {invoice.status === "rejected" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => openAction("delete", invoice)}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
