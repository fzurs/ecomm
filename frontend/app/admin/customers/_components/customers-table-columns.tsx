"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "../_lib/customer-schema";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "./customer-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Copy, Delete, Edit, EllipsisVertical, Send, View } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const customersTableColumns: ColumnDef<Customer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Username" column={column} />;
    },
    cell: ({ row }) => {
      return <TableCellViewer customer={row.original} />;
    },
    enableHiding: false,
  },
  {
    id: "fullname",
    accessorKey: "firstName",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Fullname" column={column} />;
    },
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground">
          {row.original.lastName} {row.original.lastName}
        </div>
      );
    },
  },

  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return <DataTableColumnHeader title="First name" column={column} />;
    },
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Last name" column={column} />;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Email" column={column} />;
    },
  },
  {
    accessorKey: "age",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Age" column={column} />;
    },
  },
  {
    accessorKey: "gender",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Gender" column={column} />;
    },
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.gender}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <TableColumnAction customerId={row.original.id} />;
    },
  },
];

function useViewerSearchParam(productId: number) {
  return useQueryState(
    `viewer_${productId}`,
    parseAsBoolean.withDefault(false)
  );
}

function TableCellViewer({ customer }: { customer: Customer }) {
  const [open, setOpen] = useViewerSearchParam(customer.id);
  const isMobile = useIsMobile();

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 text-foreground">
          {customer.username}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{customer.username}</DrawerTitle>
          <DrawerDescription>
            {customer.firstName} {customer.lastName}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <CustomerForm customer={customer} />
        </div>
        <DrawerFooter>
          <Button>Save changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function TableColumnAction({ customerId }: { customerId: number }) {
  const [open, setOpen] = React.useState(false);
  const setViewerOpen = useViewerSearchParam(customerId)[1];

  const handleClick = () => {
    setOpen(false);
    setViewerOpen(true);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"}>
          <EllipsisVertical />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClick}>
          <View />
          View more
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleClick}>
          <Edit />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Send />
          Send message
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Delete />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
