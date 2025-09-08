import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, Trash } from "lucide-react";
import { toast } from "sonner";

import { Category } from "@workspace/sdks/typescript-axios";

import { categoriesApi } from "@/lib/api";
import { getCategoriesQueryOptions } from "@/lib/queries";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-semibold">{row.original.name}</div>,
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const category = row.original;
      const queryClient = useQueryClient();

      const { mutate, isPending } = useMutation({
        mutationFn: () => categoriesApi.categoriesDestroy(category.id),
        onSuccess: () => {
          queryClient.invalidateQueries(getCategoriesQueryOptions());
          toast.success("Category destroyed");
        },
        onError: () => {
          toast.error("The category could not be destroyed");
        },
      });

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => mutate()}
                disabled={isPending}
                variant="destructive"
              >
                <Trash />
                Destroy
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
