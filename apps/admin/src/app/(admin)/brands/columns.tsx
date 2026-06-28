import { ColumnDef } from "@tanstack/react-table"
import { schemas } from "@workspace/api-client"
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
import z from "zod"
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
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-options"

export const columns: ColumnDef<z.infer<typeof schemas.Brand>>[] = [
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

function TableCellViewer({ item }: { item: z.infer<typeof schemas.Brand> }) {
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

function TableCellActions({ item }: { item: z.infer<typeof schemas.Brand> }) {
  const { mutate } = useOptimisticBrandDestroy(item)

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
            <AlertDialogAction variant="destructive" onClick={() => mutate()}>
              Delete Brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function useOptimisticBrandDestroy(item: z.infer<typeof schemas.Brand>) {
  const queryClient = useQueryClient()

  const destroyMutation = useMutation({
    mutationFn: () =>
      apiClient.brands_destroy(undefined, {
        params: { slug: item.slug as string },
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.brands.all() })

      const previousData = queryClient.getQueryData(queryKeys.brands.list())

      queryClient.setQueriesData(
        { queryKey: queryKeys.brands.all() },
        (
          old: Awaited<ReturnType<typeof apiClient.brands_list>> | undefined
        ) => {
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
      queryClient.setQueryData(
        queryKeys.brands.list(),
        onMutateResult?.previousData
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all() })
    },
  })

  return destroyMutation
}
