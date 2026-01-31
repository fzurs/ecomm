"use client";

import { schemas } from "@workspace/api-client";
import { Button } from "@workspace/ui/components/button";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import React, { useId, useState } from "react";
import { ProductForm } from "../test/form";
import { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString } from "nuqs";

export const columns = [
  {
    id: "name",
    header: "Name",
    cell: function TableCellViewer({ row }) {
      const item = row.original;
      const isMobile = useIsMobile();
      const queryClient = useQueryClient();

      const [open, setOpen] = useState(false);

      const form = useForm({
        resolver: zodResolver(schemas.Product),
        values: item,
      });
      const formId = useId();

      const { mutate, isPending } = useMutation({
        mutationFn: (data: z.infer<typeof schemas.Product>) =>
          apiClient.products_update(data, { params: { id: item.id } }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          setOpen(false);
        },
      });

      const onSubmit = (data: z.infer<typeof schemas.Product>) => mutate(data);

      return (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          direction={isMobile ? "bottom" : "right"}
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
            <ProductForm
              form={form}
              id={formId}
              onSubmit={onSubmit}
              className="px-4"
            />
            <DrawerFooter>
              <Button type="submit" disabled={isPending} form={formId}>
                Save changes
              </Button>
              <DrawerClose asChild>
                <Button variant="secondary">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    },
    meta: {
      variant: "search",
      placeholder: "Search for a product...",
      filterParser: parseAsString,
    },
    enableColumnFilter: true,
    enableHiding: false,
  },
  {
    id: "categories",
    accessorKey: "category",
    header: "Category",
    meta: {
      label: "Category",
      placeholder: "Search for a Category...",
      variant: "multiSelect",
      filterParser: parseAsInteger,
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
] as const satisfies ColumnDef<z.infer<typeof schemas.Product>>[];
