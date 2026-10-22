import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useRowActionDialog } from "@/context/row-actions-provider"
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
import { ProductEditForm, useProductEditForm } from "./product-edit-form"
import { Button } from "@workspace/ui/components/button"
import { RefObject, useLayoutEffect, useRef } from "react"

export function ProductEditDrawer() {
  const isMobile = useIsMobile()

  const { row, rootProps, closeAction } = useRowActionDialog<Product>("edit")

  // Survives the content remount so switching products keeps the scroll.
  const scrollTopRef = useRef(0)

  return (
    // Not modal and not dismissed by outside clicks: clicking another row swaps
    // the product instead of closing and reopening the drawer.
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      modal={false}
      disablePointerDismissal
      {...rootProps}
      onOpenChangeComplete={(open) => {
        rootProps.onOpenChangeComplete(open)
        if (!open) scrollTopRef.current = 0
      }}
    >
      <DrawerContent size="lg">
        {row && (
          // The key remounts the form when another product is opened.
          <ProductEditDrawerContent
            key={row.id}
            product={row}
            onSuccess={closeAction}
            scrollTopRef={scrollTopRef}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function ProductEditDrawerContent({
  product,
  onSuccess,
  scrollTopRef,
}: {
  product: Product
  onSuccess: () => void
  scrollTopRef: RefObject<number>
}) {
  const form = useProductEditForm({ product, onSuccess })

  const scrollRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollTopRef.current
  }, [scrollTopRef])

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{product.name}</DrawerTitle>
        <DrawerDescription className="sr-only">
          Edit the product details.
        </DrawerDescription>
      </DrawerHeader>
      <div
        ref={scrollRef}
        onScroll={(e) => {
          scrollTopRef.current = e.currentTarget.scrollTop
        }}
        className="overflow-auto p-4"
      >
        <ProductEditForm form={form} product={product} />
      </div>
      <DrawerFooter>
        <form.AppForm>
          <form.SubmitButton>Save changes</form.SubmitButton>
        </form.AppForm>
        <DrawerClose render={<Button variant="secondary" />}>Close</DrawerClose>
      </DrawerFooter>
    </>
  )
}
