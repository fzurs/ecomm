"use client";

import * as React from "react";
import { IconDotsVertical, IconTrendingUp } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Package, XCircle } from "lucide-react";
import { ProductForm } from "./product-form";
import { Product } from "../_lib/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatHumanDate } from "@/lib/humanized";
import { priceColumnOptimized } from "./product-price-column-optimized";

const getStatusSortValue = (status: string) => {
  switch (status) {
    case "Agotado":
      return 3; // Mayor prioridad (crítico)
    case "Stock Bajo":
      return 2; // Media prioridad
    case "Disponible":
      return 1; // Menor prioridad (normal)
    default:
      return 0;
  }
};

export const productsTableColumns: ColumnDef<Product>[] = [
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
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
    meta: { label: "Título" },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <p className="text-muted-foreground text-sm text-balance max-w-sm">
        {row.original.description}
      </p>
    ),
    meta: { label: "Descripción" },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader
        title={(column.columnDef.meta as { label: string }).label}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.category}
        </Badge>
      </div>
    ),
    meta: { label: "Categoría" },
  },
  // price column optimized
  priceColumnOptimized as ColumnDef<Product>,
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader
        title={(column.columnDef.meta as { label: string }).label}
        column={column}
      />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;

      const getQuantityVariant = (qty: number) => {
        if (qty === 0) return "destructive";
        if (qty <= 5) return "secondary";
        return "default";
      };

      return (
        <div className="flex justify-center">
          <Badge variant={getQuantityVariant(quantity)} className="font-mono">
            {quantity}
          </Badge>
        </div>
      );
    },
    meta: { label: "Cantidad", className: "text-center" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        title={(column.columnDef.meta as { label: string }).label}
        column={column}
      />
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const statusA = rowA.getValue(columnId) as string;
      const statusB = rowB.getValue(columnId) as string;
      return getStatusSortValue(statusA) - getStatusSortValue(statusB);
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const getStatusConfig = (status: string) => {
        switch (status) {
          case "Disponible":
            return {
              variant: "default",
              icon: CheckCircle,
              className:
                "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
            };
          case "Agotado":
            return {
              variant: "destructive",
              icon: XCircle,
              className: "",
            };
          case "Stock Bajo":
            return {
              variant: "secondary",
              icon: AlertTriangle,
              className:
                "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
            };
          default:
            return {
              variant: "outline",
              icon: Package,
              className: "",
            };
        }
      };

      const config = getStatusConfig(status);
      const IconComponent = config.icon;

      return (
        <div className="flex justify-center">
          <Badge
            variant={
              config.variant as
                | "default"
                | "destructive"
                | "secondary"
                | "outline"
            }
            className={`flex items-center gap-1.5 ${config.className}`}
          >
            <IconComponent className="w-3 h-3" />
            {status}
          </Badge>
        </div>
      );
    },
    meta: { label: "Estado" },
  },
  {
    accessorKey: "last_update",
    header: ({ column }) => (
      <DataTableColumnHeader
        title={(column.columnDef.meta as { label: string }).label}
        column={column}
      />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm text-end">
        {formatHumanDate(row.original.last_update)}
      </div>
    ),
    meta: { label: "Última actualización" },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem>Copiar ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Borrar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: Product }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription>
            Total de ventas en los ultimos 6 meses
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Se registro un aumento del 1.5% en este mes{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Se muestra el total de ventas de los últimos 6 meses. Este es
                  solo un texto aleatorio para probar el diseño. Ocupa varias
                  líneas y debería ajustarse.
                </div>
              </div>
              <Separator />
            </>
          )}
          <ProductForm item={item} />
        </div>
        <DrawerFooter>
          <Button>Guardar cambios</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
