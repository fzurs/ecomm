import { formatPrice } from "@/lib/utils"
import { OrderItem } from "@workspace/api-client"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import React from "react"

export function OrderItemsTable({
  orderItems,
  renderActions,
  renderQuantity,
  showTotal = false,
  variant = "default",
  total,
}: {
  orderItems: OrderItem[]
  renderActions?: (index: number) => React.ReactNode
  renderQuantity?: (index: number) => React.ReactNode
  showTotal?: boolean
  variant?: "default" | "compact"
  total?: number
}) {
  return (
    <Table className={cn(variant === "compact" && "[&_th]:h-6")}>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-center">Unit Price</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          {renderActions && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderItems.map(
          ({ product_detail: product, quantity, subtotal }, index) => (
            <TableRow key={index}>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-center">
                {renderQuantity?.(index) ?? quantity}
              </TableCell>
              <TableCell className="text-center">
                {product.price && formatPrice(product.price)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatPrice(subtotal)}
              </TableCell>
              {renderActions && (
                <TableCell className="text-right">
                  {renderActions(index)}
                </TableCell>
              )}
            </TableRow>
          )
        )}
      </TableBody>
      {showTotal && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              {total && formatPrice(total)}
            </TableCell>
            {renderActions && <TableCell />}
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
}
