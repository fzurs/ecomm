"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Order } from "../_lib/order-schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Delete, EllipsisVertical, User, View } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const orderStatuses = [
  "pending", // Pendiente - Orden creada, esperando pago
  "processing", // Procesando - Pago confirmado, preparando envío
  "shipped", // Enviado - Orden en tránsito
  "delivered", // Entregado - Orden recibida por el cliente
  "cancelled", // Cancelado - Orden cancelada
  "refunded", // Reembolsado - Dinero devuelto
];

export const ordersTableColumns: ColumnDef<Order>[] = [
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
    accessorKey: "order_id",
    header: "Order ID",
    cell: ({ row }) => {
      return <Button variant="link">{row.original.order_id}</Button>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }) => {
      return <Button variant="link">{row.original.user_id}</Button>;
    },
    meta: { label: "User ID" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <Badge variant={"secondary"}>{row.original.status}</Badge>;
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total amount",
    meta: { label: "Total amount" },
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground">
          {row.original.items.map((item) => item.product_id).join(", ")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return <TableColumnAction />;
    },
  },
];
function TableColumnAction() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size="icon">
          <EllipsisVertical />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <View />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy />
          Copy order ID
        </DropdownMenuItem>
        <DropdownMenuItem>
          <User />
          View customer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="p-0">
            <Command value="pending">
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {orderStatuses.map((status) => (
                    <CommandItem key={status} value={status}>
                      {status}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Delete />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
