import { Customer } from "@workspace/api-client"
import { cn } from "cn"
import {
  BuildingIcon,
  IdCardIcon,
  LandmarkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react"
import { documentTypes, vatConditions } from "@/lib/fiscal"

type DetailRow = {
  label: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  // Shown muted instead of the dash when there's no value.
  fallback?: string
}

/** How to reach the customer. Same groups and order as the edit form. */
export function CustomerContactDetails({
  customer,
  ...props
}: { customer: Customer } & React.ComponentProps<"dl">) {
  return (
    <DetailList
      rows={[
        { label: "Email", value: customer.email, icon: MailIcon },
        { label: "Phone", value: customer.phone, icon: PhoneIcon },
      ]}
      {...props}
    />
  )
}

/** What goes on the customer's invoices, in the order the edit form asks it. */
export function CustomerBillingDetails({
  customer,
  ...props
}: { customer: Customer } & React.ComponentProps<"dl">) {
  return (
    <DetailList
      rows={[
        {
          label: "IVA condition",
          value: vatConditions[customer.vat_condition ?? 5],
          icon: LandmarkIcon,
        },
        {
          label: "Document",
          value: customer.document_number && (
            <span className="tabular-nums">
              {documentTypes[customer.document_type ?? 80]}{" "}
              {customer.document_number}
            </span>
          ),
          icon: IdCardIcon,
          // A final consumer can be invoiced without one.
          fallback: "Unidentified",
        },
        {
          label: "Legal name",
          value: customer.legal_name,
          icon: BuildingIcon,
          fallback: "Same as the name",
        },
        { label: "Address", value: customer.address, icon: MapPinIcon },
      ]}
      {...props}
    />
  )
}

function DetailList({
  rows,
  className,
  ...props
}: { rows: DetailRow[] } & React.ComponentProps<"dl">) {
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
            {row.value || (
              <span className="text-muted-foreground">
                {row.fallback ?? "—"}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
