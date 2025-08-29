import { categoriesQueryOptions } from "@/lib/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

export type Customer = {
  id: number;
  name: string;
  role: string;
};

export function useColumns(): ColumnDef<Customer>[] {
  const categories = useSuspenseQuery(categoriesQueryOptions).data;

  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: {
        variant: "select",
        options: categories.map((category) => ({
          label: category.name,
          value: category.slug,
        })),
      },
    },
  ];
}
