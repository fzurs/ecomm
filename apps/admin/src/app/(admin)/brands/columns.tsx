import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import * as React from "react"
import { BrandForm, useBrandForm } from "./form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { IconTrash } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Brand, PaginatedBrandList } from "@workspace/api-client"
import {
  brandsDestroyMutation,
  brandsListQueryKey,
} from "@workspace/api-client/query"

export const columns: ColumnDef<Brand>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <TableCellActions item={row.original} />,
  },
]

function TableCellViewer({ item }: { item: Brand }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  const form = useBrandForm({ item, setOpen })

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button size="sm" variant="link">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item.name}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-auto px-4 pb-4">
          <BrandForm form={form} />
        </div>
        <DrawerFooter>
          <form.AppForm>
            <form.Submit>Save Changes</form.Submit>
          </form.AppForm>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function TableCellActions({ item }: { item: Brand }) {
  const destroyMutation = useOptimisticBrandDestroy(item)
  const onDestroy = () =>
    destroyMutation.mutate({ path: { slug: item.slug as string } })

  return (
    <div className="flex justify-end">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon-sm" variant="ghost">
            <IconTrash />
            <span className="sr-only">Delete</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <IconTrash />
            </AlertDialogMedia>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Once deleted, there is no going back; the item will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDestroy}>
              Delete Brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function useOptimisticBrandDestroy(item: Brand) {
  const queryClient = useQueryClient()
  const queryKey = brandsListQueryKey()

  const destroyMutation = useMutation({
    ...brandsDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey,
      })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedBrandList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((brand) => brand.id !== item.id),
          }
        }
      )

      return { previousData }
    },
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return destroyMutation
}
