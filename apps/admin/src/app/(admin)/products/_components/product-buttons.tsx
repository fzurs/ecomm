import { Product } from "@workspace/api-client"
import { EditIcon } from "lucide-react"
import { useRowActions } from "@/context/row-actions-provider"
import { Button } from "@workspace/ui/components/button"

export function ProductEditButton({
  product,
  ...props
}: { product: Product } & React.ComponentProps<typeof Button>) {
  const { openAction } = useRowActions<Product>()

  return (
    <Button
      variant="outline"
      onClick={() => openAction("edit", product)}
      {...props}
    >
      <EditIcon />
      Edit
    </Button>
  )
}
