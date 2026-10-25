import { Customer } from "@workspace/api-client"
import { cn } from "cn"
import { PhoneIcon, IdCardIcon } from "lucide-react"

export function CustomerDetails({
  customer,
  className,
  ...props
}: { customer: Customer } & React.ComponentProps<"dl">) {
  const rows = [
    { label: "Phone", value: customer.phone, icon: PhoneIcon },
    {
      label: "CUIT",
      value: customer.document_number,
      icon: IdCardIcon,
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
