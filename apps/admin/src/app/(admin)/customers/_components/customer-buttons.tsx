import { Customer } from "@workspace/api-client"
import { EditIcon } from "lucide-react"
import { useRowActions } from "@/context/row-actions-provider"
import { Button } from "@workspace/ui/components/button"

export function CustomerEditButton({
  customer,
  ...props
}: { customer: Customer } & React.ComponentProps<typeof Button>) {
  const { openAction } = useRowActions<Customer>()

  return (
    <Button
      variant="outline"
      onClick={() => openAction("edit", customer)}
      {...props}
    >
      <EditIcon />
      Edit customer
    </Button>
  )
}
