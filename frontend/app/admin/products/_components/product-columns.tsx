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
import { AlertTriangle, ArrowUpDown, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { ProductForm } from "./product-form";
import { Product } from "../_lib/types";

export const columns: ColumnDef<Product>[] = [
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
    accessorKey: "image",
    header: () => null,
    cell: ({ row }) => (
      <Image
        src={row.original.image ?? `/products/${row.original.title}.webp`}
        alt=""
        width={50}
        height={50}
        className="h-12 w-12 rounded-lg"
      />
    ),
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <p className="text-muted-foreground text-sm text-balance max-w-sm">
        {row.original.description}
      </p>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.category}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as string;
      return (
        <div className="font-medium text-right">
          <span className="text-green-600 font-semibold">{price}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Cantidad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const status = row.original.status;

      // Determine stock status and styling
      const getStockBadge = (qty: number, status: string) => {
        if (qty === 0 || status === "Agotado") {
          return (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Agotado
            </Badge>
          );
        } else if (qty <= 10 || status === "Poco stock") {
          return (
            <Badge
              variant="secondary"
              className="ml-2 bg-yellow-100 text-yellow-800"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Poco stock
            </Badge>
          );
        } else {
          return (
            <Badge
              variant="default"
              className="ml-2 bg-green-100 text-green-800"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              En stock
            </Badge>
          );
        }
      };

      return (
        <div className="flex items-center">
          <span className="font-medium min-w-[3rem] text-right">
            {quantity.toLocaleString()}
          </span>
          {getStockBadge(quantity, status)}
        </div>
      );
    },
  },
  {
    accessorKey: "last_update",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Última Actualización
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("last_update") as Date;

      // Format the date
      const formattedDate = format(new Date(date), "dd/MM/yyyy", {
        locale: es,
      });
      const formattedTime = format(new Date(date), "HH:mm", { locale: es });

      // Calculate days since last update
      const daysSince = Math.floor(
        (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
      );

      const getUpdateBadge = (days: number) => {
        if (days === 0) {
          return (
            <Badge variant="default" className="ml-2 bg-blue-100 text-blue-800">
              Hoy
            </Badge>
          );
        } else if (days <= 7) {
          return (
            <Badge variant="secondary" className="ml-2">
              Reciente
            </Badge>
          );
        } else if (days <= 30) {
          return (
            <Badge variant="outline" className="ml-2">
              Este mes
            </Badge>
          );
        } else {
          return (
            <Badge variant="secondary" className="ml-2">
              Antigua
            </Badge>
          );
        }
      };

      return (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center">
            <div className="text-sm">
              <div className="font-medium">{formattedDate}</div>
              <div className="text-muted-foreground text-xs">
                {formattedTime}
              </div>
            </div>
            {getUpdateBadge(daysSince)}
          </div>
        </div>
      );
    },
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
