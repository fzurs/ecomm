import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import {
  useRowActionDialog,
  useRowActions,
} from "@/context/row-actions-provider"
import { useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Product } from "@workspace/api-client"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Maximize2Icon, PackageIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { ProductDetails } from "./product-details"
import { ProductDescription } from "./product-description"
import { ProductEditButton } from "./product-buttons"
import { ProductEditDrawerContent } from "./product-edit-drawer"
import { ProductPrice } from "./product-price"
import Link from "next/link"

export function ProductViewDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps } = useRowActionDialog<Product>("view")

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} {...rootProps}>
      <DrawerContent size="md">
        {row && <ProductViewDrawerContent product={row} />}
      </DrawerContent>
    </Drawer>
  )
}

function ProductViewDrawerContent({ product }: { product: Product }) {
  const isMobile = useIsMobile()
  const { openAction } = useRowActions<Product>()

  // Edit opens on top of this drawer instead of replacing it, so it's local
  // state: a row action would close the view.
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <DrawerHeader className="group-data-[swipe-axis=y]/drawer-popup:text-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar shape="square" className="size-20">
              {product.image && <AvatarImage src={product.image} />}
              <AvatarFallback>
                <PackageIcon className="size-1/3" />
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <DrawerTitle className="text-base">{product.name}</DrawerTitle>
              <DrawerDescription render={<div />}>
                <ProductPrice product={product} className="text-foreground" />
              </DrawerDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProductEditButton
              product={product}
              size="sm"
              onClick={() => setEditOpen(true)}
            />
            <Link
              href={`/products/${product.slug}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Maximize2Icon />
              Open page
            </Link>
          </div>
        </div>
      </DrawerHeader>
      <div className="flex flex-1 scroll-fade flex-col gap-8 overflow-y-auto p-4 pt-8">
        {product.description && (
          <div className="flex flex-col gap-2">
            <div className="typeset">
              <h3>Description</h3>
            </div>
            <ProductDescription description={product.description} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="typeset">
            <h3>Product details</h3>
          </div>
          <ProductDetails product={product} />
        </div>
      </div>
      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
      </DrawerFooter>
      {/* Rendered inside the view's content, so Base UI stacks it as nested. */}
      <Drawer
        swipeDirection={isMobile ? "down" : "right"}
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DrawerContent size="md">
          <ProductEditDrawerContent
            product={product}
            onSuccess={(updated) => {
              setEditOpen(false)
              // The view shows the table row; swap in the saved product.
              openAction("view", updated)
            }}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}
