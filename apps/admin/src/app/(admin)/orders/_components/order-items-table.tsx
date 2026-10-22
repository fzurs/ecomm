import { formatPrice } from "@/lib/utils"
import { OrderItem } from "@workspace/api-client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
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
          <TableHead className="text-center">Unit price</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          {renderActions && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orderItems.map(
          ({ product_detail: product, quantity, subtotal }, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar shape="square" size="sm">
                    {product.image && <AvatarImage src={product.image} />}
                    <AvatarFallback />
                  </Avatar>
                  {product.name}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {renderQuantity?.(index) ?? quantity}
              </TableCell>
              <TableCell className="text-center">
                {formatPrice(product.price)}
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
            <TableCell>Total</TableCell>
            <TableCell className="text-center">
              {orderItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0)}
            </TableCell>
            <TableCell />
            <TableCell className="text-right">{formatPrice(total)}</TableCell>
            {renderActions && <TableCell />}
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
}
