import { schemas } from "@workspace/api-client"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import z from "zod"

export function ProductCard({
  product,
  isLink = false,
}: {
  product: z.infer<typeof schemas.Product>
  isLink?: boolean
}) {
  return (
    <Card className={cn(isLink && "transition-color hover:border-amber-500")}>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
