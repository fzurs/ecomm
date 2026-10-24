"use client"
import { useQuery } from "@tanstack/react-query"
import { OrderItemWritable } from "@workspace/api-client"
import { productsListChoicesOptions } from "@workspace/api-client/query"
import { zProductStatus } from "@workspace/api-client/zod"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { PlusIcon } from "lucide-react"
import * as React from "react"
import { formatPrice } from "@/lib/utils"

export function AddOrderItem({
  orderItems,
  addOrderItem,
  replaceOrderItem,
}: {
  orderItems: OrderItemWritable[]
  addOrderItem: (index: number, newItem: OrderItemWritable) => void
  replaceOrderItem: (index: number, updatedItem: OrderItemWritable) => void
}) {
  const { data: products } = useQuery(
    productsListChoicesOptions({
      query: {
        status: [zProductStatus.enum.active],
        price_min: 1,
      },
    })
  )

  const productItems = React.useMemo(
    () =>
      products?.map((product) => {
        const orderItemIndex = orderItems.findIndex(
          (item) => product.id === item.product
        )
        const orderItem = orderItems[orderItemIndex]
        const isSelected = orderItem !== undefined
        const onSelect = () => {
          if (isSelected) {
            replaceOrderItem(orderItemIndex, {
              ...orderItem,
              quantity: (orderItem.quantity ?? 0) + 1,
            })
          } else {
            addOrderItem(orderItems.length, {
              product: product.id,
              quantity: 1,
            })
          }
        }
        const quantity = orderItem?.quantity ?? 1
        return { product, isSelected, onSelect, quantity }
      }) ?? [],
    [addOrderItem, orderItems, products, replaceOrderItem]
  )

  return (
    <Popover>
      <PopoverTrigger
        render={<Button type="button" size="sm" variant="secondary" />}
      >
        <PlusIcon />
        Add Item
      </PopoverTrigger>
      <PopoverContent
        className="w-96 max-w-(--available-width) p-0"
        align="end"
      >
        <Command>
          <CommandInput placeholder="Filter by name" />
          <CommandList>
            <CommandEmpty>No products result.</CommandEmpty>
            <CommandGroup>
              {productItems.map(
                ({ product, isSelected, onSelect, quantity }) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={onSelect}
                    // Hides CommandItem's check icon: it's never checked here, but its
                    // space would push the quantity badge away from the end.
                    className="*:[svg]:hidden"
                  >
                    <Item className="w-full p-0" size="sm">
                      <ItemMedia>
                        <Avatar shape="square" size="lg">
                          {product.image && <AvatarImage src={product.image} />}
                          <AvatarFallback />
                        </Avatar>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{product.name}</ItemTitle>
                        <ItemDescription className="flex items-center gap-1.5">
                          {formatPrice(product.active_price)}
                          {product.discount_percent && (
                            <>
                              <span className="line-through">
                                {formatPrice(product.price)}
                              </span>
                              <Badge variant="secondary">
                                -{product.discount_percent}%
                              </Badge>
                            </>
                          )}
                        </ItemDescription>
                      </ItemContent>
                      {isSelected && (
                        <ItemActions>
                          <Badge variant="outline">x{quantity}</Badge>
                        </ItemActions>
                      )}
                    </Item>
                  </CommandItem>
                )
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
