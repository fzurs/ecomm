import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActionDialog } from "@/context/row-actions-provider"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { Product } from "@workspace/api-client"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Maximize2Icon, PackageIcon, XIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { ProductDetails } from "./product-details"
import { ProductDescription } from "./product-description"
import { ProductEditButton } from "./product-buttons"
import { ProductPrice } from "./product-price"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { DialogClose } from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
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
  return (
    <>
      <div className="flex h-(--header-height) items-center justify-between gap-4 border-b px-4">
        <Breadcrumb className="min-w-0">
          {/* No wrapping: only the product name shrinks, with an ellipsis. */}
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="shrink-0">Products</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="min-w-0 truncate">
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex h-4 items-center gap-2 text-muted-foreground">
          <Link
            href={`/products/${product.slug}`}
            className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
          >
            <Maximize2Icon />
            <span className="sr-only">Open product page</span>
          </Link>
          <Separator orientation="vertical" />
          <DialogClose render={<Button size="icon-sm" variant="ghost" />}>
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </div>
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
            <ProductEditButton product={product} size="sm" />
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
    </>
  )
}
