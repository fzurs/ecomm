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
import { CategoryForm, useCategoryForm } from "./form"
import * as React from "react"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { IconDots, IconTrash } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category, PaginatedCategoryList } from "@workspace/api-client"
import {
  categoriesDestroyMutation,
  categoriesListQueryKey,
} from "@workspace/api-client/query"

export const columns: ColumnDef<Category>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  {
    id: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="min-w-sm text-sm text-pretty text-muted-foreground">
        {row.original.description}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <TableCellActions item={row.original} />,
  },
]

function TableCellViewer({ item }: { item: Category }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  const form = useCategoryForm({ item, setOpen })

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
      modal={false}
    >
      <DrawerTrigger asChild>
        <Button size="sm" variant="link">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "slideToRight") {
            form.reset()
          }
        }}
      >
        <DrawerHeader>
          <DrawerTitle>{item.name}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-auto px-4 pb-4">
          <CategoryForm form={form} />
        </div>
        <DrawerFooter>
          <form.AppForm>
            <form.Submit>Save changes</form.Submit>
          </form.AppForm>
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function TableCellActions({ item }: { item: Category }) {
  const destroyMutation = useOptimisticCategoryDestroy(item)
  const onDestroy = () =>
    destroyMutation.mutate({ path: { slug: item.slug as string } })

  return (
    <div className="flex justify-end">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDots />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive">
                  <IconTrash />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function useOptimisticCategoryDestroy(item: Category) {
  const queryClient = useQueryClient()

  const queryKey = categoriesListQueryKey()

  const mutation = useMutation({
    ...categoriesDestroyMutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueriesData(
        { queryKey },
        (old: PaginatedCategoryList | undefined) => {
          if (!old) return old
          return {
            ...old,
            results: old.results.filter((category) => category.id !== item.id),
          }
        }
      )

      return { previousData }
    },
    onError: (err, _, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return mutation
}
