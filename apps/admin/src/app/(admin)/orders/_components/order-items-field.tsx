"use client"
import { useQuery } from "@tanstack/react-query"
import { OrderItem, OrderItemWritable, Product } from "@workspace/api-client"
import { productsListChoicesOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"
import * as React from "react"
import { OrderItemsTable } from "./order-items-table"

export function OrderItemsField({
  orderItems,
  renderQuantity,
  removeOrderItem,
}: {
  orderItems: OrderItemWritable[]
  renderQuantity: (index: number) => React.ReactNode
  removeOrderItem: (index: number) => void
}) {
  const { data: products } = useQuery(productsListChoicesOptions())

  const rows = React.useMemo<OrderItem[]>(
    () =>
      orderItems.map((orderItem) => {
        const product = products?.find(
          (product) => product.id === orderItem.product
        )

        // A preview: the API sets the unit price from active_price on create.
        const unitPrice = product?.active_price ?? 0
        const subtotal = unitPrice * (orderItem.quantity ?? 0)

        return {
          id: -1,
          subtotal,
          product: product?.id ?? 0,
          product_detail: product as Product,
          quantity: orderItem.quantity,
          unit_price: unitPrice,
        }
      }),
    [orderItems, products]
  )

  const total = rows.reduce((sum, row) => sum + row.subtotal, 0)

  return (
    <OrderItemsTable
      orderItems={rows}
      renderQuantity={renderQuantity}
      renderActions={(index) => (
        <Button
          type="button"
          variant="destructive"
          size="icon-xs"
          aria-label="Remove item"
          onClick={() => removeOrderItem(index)}
        >
          <XIcon />
        </Button>
      )}
      showTotal
      total={total}
    />
  )
}
