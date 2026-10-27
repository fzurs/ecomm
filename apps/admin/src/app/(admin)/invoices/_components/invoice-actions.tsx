"use client"
import { Invoice, InvoiceDetail } from "@workspace/api-client"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  FileDownIcon,
  FileMinusIcon,
  FilePlusIcon,
  RefreshCwIcon,
  SearchCheckIcon,
} from "lucide-react"
import Link from "next/link"
import {
  useEmitInvoice,
  useVerifyInvoice,
} from "../_hooks/use-invoice-mutations"
import { invoicePdfUrl } from "../_lib/invoice-pdf"

type Size = "default" | "sm"

/** What can be done with a voucher in its status, as buttons. */
export function InvoiceActions({
  invoice,
  size = "default",
}: {
  invoice: Invoice | InvoiceDetail
  size?: Size
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {invoice.status === "authorized" && (
        <a
          href={invoicePdfUrl(invoice.id)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline", size })}
        >
          <FileDownIcon />
          PDF
        </a>
      )}
      {invoice.kind === "invoice" && invoice.status === "authorized" && (
        <>
          <NoteLink invoice={invoice} kind="credit-note" size={size} />
          <NoteLink invoice={invoice} kind="debit-note" size={size} />
        </>
      )}
      {invoice.status === "rejected" && (
        <EmitButton invoice={invoice} size={size} />
      )}
      {invoice.status === "unverified" && (
        <VerifyButton invoice={invoice} size={size} />
      )}
    </div>
  )
}

const notes = {
  "credit-note": { label: "Credit note", icon: FileMinusIcon },
  "debit-note": { label: "Debit note", icon: FilePlusIcon },
}

function NoteLink({
  invoice,
  kind,
  size,
}: {
  invoice: Invoice | InvoiceDetail
  kind: keyof typeof notes
  size: Size
}) {
  const { label, icon: Icon } = notes[kind]
  const reason = invoice.notes_unavailable_reason

  // Disabled, with the reason (e.g. arca-client doesn't emit B notes yet).
  if (reason) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size={size}
              disabled
              focusableWhenDisabled
            />
          }
        >
          <Icon />
          {label}
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link
      href={`/invoices/${invoice.id}/${kind}`}
      className={buttonVariants({ variant: "outline", size })}
    >
      <Icon />
      {label}
    </Link>
  )
}

function EmitButton({
  invoice,
  size,
}: {
  invoice: Invoice | InvoiceDetail
  size: Size
}) {
  const { mutate, isPending } = useEmitInvoice()

  return (
    <Button
      size={size}
      disabled={isPending}
      onClick={() => mutate({ path: { id: invoice.id } })}
    >
      <RefreshCwIcon />
      {isPending ? "Emitting..." : "Emit again"}
    </Button>
  )
}

function VerifyButton({
  invoice,
  size,
}: {
  invoice: Invoice | InvoiceDetail
  size: Size
}) {
  const { mutate, isPending } = useVerifyInvoice()

  return (
    <Button
      size={size}
      disabled={isPending}
      onClick={() => mutate({ path: { id: invoice.id } })}
    >
      <SearchCheckIcon />
      {isPending ? "Asking ARCA..." : "Verify with ARCA"}
    </Button>
  )
}
