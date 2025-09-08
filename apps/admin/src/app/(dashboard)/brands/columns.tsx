import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, ExternalLink, Loader2, Trash } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import * as React from "react";

import { Brand } from "@workspace/api-client";

import { brandsApi } from "@/lib/api";
import { getBrandsQueryOptions } from "@/lib/queries";
import { handleBadRequestError } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BrandForm } from "./form";

export const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: function Cell({ row }) {
      const brand = row.original;
      const formId = `update-form-${brand.id}`;

      const [open, setOpen] = React.useState(false);

      const isMobile = useIsMobile();
      const queryClient = useQueryClient();

      const form = useForm<Brand>({ defaultValues: brand });

      const { mutate, isPending } = useMutation({
        mutationFn: (data: Brand) =>
          brandsApi.brandsUpdate({ brand: data, id: brand.id }),
        onError: (err) => {
          handleBadRequestError(err, form);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["brands"] });
          setOpen(false);
        },
      });

      return (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          direction={isMobile ? "bottom" : "right"}
        >
          <DrawerTrigger asChild>
            <Button variant="link" size="sm">
              {brand.name}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{brand.name}</DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <BrandForm
              form={form}
              onSubmit={form.handleSubmit((data) => mutate(data))}
              id={formId}
              className="px-4 overflow-auto"
            />
            <DrawerFooter>
              <Button type="submit" form={formId} disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isPending ? "Saving..." : "Save"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    },
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) =>
      row.original.website && (
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground"
          asChild
        >
          <Link href={row.original.website} target="_blank">
            <ExternalLink />
            {row.original.website}
          </Link>
        </Button>
      ),
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const brand = row.original;
      const queryClient = useQueryClient();

      const { mutate, isPending } = useMutation({
        mutationFn: () => brandsApi.brandsDestroy({ id: brand.id }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["brands"] });
          toast.success("Brand destroyed");
        },
        onError: () => {
          toast.error("The brand could not be destroyed");
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
