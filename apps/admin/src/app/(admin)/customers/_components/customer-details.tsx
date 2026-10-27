import { Customer } from "@workspace/api-client"
import { cn } from "cn"
import {
  BuildingIcon,
  IdCardIcon,
  LandmarkIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react"
import { documentTypes, formatDocument, vatConditions } from "@/lib/fiscal"

export function CustomerDetails({
  customer,
  className,
  ...props
}: { customer: Customer } & React.ComponentProps<"dl">) {
  const rows = [
    { label: "Phone", value: customer.phone, icon: PhoneIcon },
    {
      label: "Document",
      value:
        customer.document_number &&
        formatDocument(
          documentTypes[customer.document_type ?? 80],
          customer.document_number
        ),
      icon: IdCardIcon,
    },
    {
      label: "IVA condition",
      value: vatConditions[customer.vat_condition ?? 5],
      icon: LandmarkIcon,
    },
    { label: "Legal name", value: customer.legal_name, icon: BuildingIcon },
    { label: "Address", value: customer.address, icon: MapPinIcon },
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
