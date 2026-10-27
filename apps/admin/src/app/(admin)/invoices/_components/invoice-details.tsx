import {
  formatDocument,
  receptorDocumentTypes,
  vatConditions,
} from "@/lib/fiscal"
import { Invoice, InvoiceDetail } from "@workspace/api-client"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "cn"
import { format } from "date-fns"
import {
  CalendarClockIcon,
  CalendarIcon,
  FingerprintIcon,
  IdCardIcon,
  LandmarkIcon,
  MapPinIcon,
  ShoppingCartIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"

const day = (date: string | null) => date && format(date, "MMMM dd, yyyy")

/** The receptor as it was invoiced, and the voucher's ARCA data. */
export function InvoiceDetails({
  invoice,
  className,
  ...props
}: { invoice: Invoice | InvoiceDetail } & React.ComponentProps<"dl">) {
  const rows = [
    { label: "Receptor", value: invoice.receptor_name, icon: UserIcon },
    {
      label: "Document",
      value: formatDocument(
        receptorDocumentTypes[invoice.receptor_document_type],
        invoice.receptor_document_number
      ),
      icon: IdCardIcon,
    },
    {
      label: "IVA condition",
      value: vatConditions[invoice.receptor_vat_condition],
      icon: LandmarkIcon,
    },
    { label: "Address", value: invoice.receptor_address, icon: MapPinIcon },
    {
      label: "Order",
      value: (
        <Link
          href={`/orders/${invoice.order_number}`}
          className={cn(buttonVariants({ variant: "link" }), "h-auto px-0")}
        >
          {invoice.order_number}
        </Link>
      ),
      icon: ShoppingCartIcon,
    },
    {
      label: "Point of sale",
      value: String(invoice.point_of_sale).padStart(5, "0"),
      icon: StoreIcon,
    },
    { label: "Issued", value: day(invoice.issue_date), icon: CalendarIcon },
    { label: "CAE", value: invoice.cae, icon: FingerprintIcon },
    {
      label: "CAE expires",
      value: day(invoice.cae_expiration_date),
      icon: CalendarClockIcon,
    },
  ]

  return (
    <dl
      className={cn(
        "grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-0",
        className
      )}
      {...props}
    >
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="flex items-center gap-2 py-2 text-muted-foreground">
            <row.icon className="size-4" />
            {row.label}
          </dt>
          <dd className="py-2">
            {row.value || <span className="text-muted-foreground">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
