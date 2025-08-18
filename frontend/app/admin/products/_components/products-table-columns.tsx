"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "../_lib/product-schema";
import { Badge } from "@/components/ui/badge";
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
import { ProductForm } from "./product-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseAsBoolean, useQueryState } from "nuqs";
import {
  Copy,
  Delete,
  Edit,
  EllipsisVertical,
  Star,
  StarHalf,
  View,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Separator } from "@/components/ui/separator";

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
    header: ({ column }) => {
      return <DataTableColumnHeader title="Title" column={column} />;
    },
    cell: ({ row }) => {
      return <TableCellViewer product={row.original} />;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] text-muted-foreground truncate">
          {row.original.description}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Category" column={column} />;
    },
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="capitalize">
          {row.original.category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Price" column={column} />;
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Rating" column={column} />;
    },
    cell: ({ row }) => {
      const { rating, reviews } = row.original;
      return (
        <div className="flex items-center gap-2">
          <StarRating rating={rating} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{rating}</span>
            {reviews.length > 0 && (
              <span className="text-xs">({reviews.length} reviews)</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return <DataTableColumnHeader title="Stock" column={column} />;
    },
    cell: ({ row }) => {
      const stock = row.original.stock;

      function getStockColor(stock: number) {
        let className: string;
        if (stock === 0) {
          className = "bg-red-100 text-red-800 border-red-200";
        } else if (stock <= 5) {
          className = "bg-orange-100 text-orange-800 border-orange-200";
        } else if (stock <= 10) {
          className = "bg-amber-100 text-amber-800 border-amber-200";
        } else {
          className = "bg-green-100 text-green-800 border-green-200";
        }
        return className;
      }

      return <Badge className={cn(getStockColor(stock))}>{stock} units</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created at",
    cell: ({ row }) => {
      return row.original.meta.createdAt.toDateString();
    },
    meta: { label: "Created at" },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated at",
    cell: ({ row }) => {
      return row.original.meta.updatedAt.toDateString();
    },
    meta: { label: "Updated at" },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <TableColumnAction productId={row.original.id} />;
    },
  },
];

function useViewerSearchParam(productId: number) {
  return useQueryState(
    `viewer_${productId}`,
    parseAsBoolean.withDefault(false)
  );
}

function TableCellViewer({ product }: { product: Product }) {
  const [open, setOpen] = useViewerSearchParam(product.id);
  const isMobile = useIsMobile();

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 text-foreground">
          {product.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{product.title}</DrawerTitle>
          <DrawerDescription className="text-muted-foreground leading-5.5">
            {product.description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid gap-1 justify-center text-center md:text-start md:justify-start">
            <span className="text-muted-foreground text-sm">
              Rating: {product.rating}/5
            </span>
            <StarRating rating={product.rating} />
          </div>
          <Separator />
          <ProductForm product={product} />
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

function StarRating({
  rating,
  maxRating = 5,
}: {
  rating: number;
  maxRating?: number;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* Estrellas llenas */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-muted-foreground text-muted-foreground"
        />
      ))}

      {/* Media estrella */}
      {hasHalfStar && (
        <div className="relative">
          <Star className="absolute w-4 h-4 text-muted-foreground" />
          <StarHalf className="w-4 h-4 fill-muted-foreground text-muted-foreground" />
        </div>
      )}

      {/* Estrellas vacías */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground" />
      ))}
    </div>
  );
}

function TableColumnAction({ productId }: { productId: number }) {
  const [open, setOpen] = React.useState(false);
  const setViewerOpen = useViewerSearchParam(productId)[1];

  const handleClick = () => {
    setOpen(false);
    setViewerOpen(true);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size="icon">
          <EllipsisVertical />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Delete />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
