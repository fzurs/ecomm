import {
  createColumnHelper,
  SortingFn,
  FilterFn,
  Row,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { Product } from "../_lib/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export type PriceRange = "Premium" | "Estándar" | "Económico";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export interface PriceConfig {
  variant: BadgeVariant;
  label: PriceRange;
  className: string;
}

export interface PriceFilterValue {
  min: number;
  max: number;
}

const columnHelper = createColumnHelper<Product>();

// Función para convertir precio string a número
const parsePriceToNumber = (priceString: string): number => {
  if (!priceString) return 0;
  // Remueve símbolos de moneda, espacios y convierte a número
  return parseFloat(priceString.replace(/[$,\s]/g, ""));
};

// Función para formatear precio para display
const formatPrice = (price: string | number): string => {
  if (typeof price === "string") {
    return price;
  }
  return `${price.toFixed(2)}`;
};

// Función para obtener variant del badge basado en precio
const getPriceVariant = (price: number): BadgeVariant => {
  if (price >= 100) return "default"; // Premium
  if (price >= 50) return "secondary"; // Mid-range
  return "outline"; // Budget
};

// Función para obtener clases CSS basadas en precio
const getPriceColor = (price: number): string => {
  if (price >= 100) return "text-green-700 bg-green-50";
  if (price >= 50) return "text-blue-700 bg-blue-50";
  return "text-gray-700 bg-gray-50";
};

// Columna Price OPTIMIZADA para sorting
export const priceColumn = columnHelper.accessor("price", {
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title={(column.columnDef.meta as { label: string }).label}
    />
  ),
  meta: { label: "Precio" },
  // OPCIÓN 1: Sorting function personalizada (si price es string)
  sortingFn: ((
    rowA: Row<Product>,
    rowB: Row<Product>,
    columnId: string
  ): number => {
    const priceA = parsePriceToNumber(rowA.getValue(columnId));
    const priceB = parsePriceToNumber(rowB.getValue(columnId));
    return priceA - priceB;
  }) as SortingFn<Product>,
  cell: (info) => {
    const price = info.getValue();
    const numericPrice = parsePriceToNumber(price);

    return (
      <div className="flex justify-end">
        <Badge variant={getPriceVariant(numericPrice)} className="font-mono">
          {formatPrice(price)}
        </Badge>
      </div>
    );
  },
});

// OPCIÓN 2: Columna con accessor function (MÁS EFICIENTE)
export const priceColumnOptimized = columnHelper.accessor(
  // Accessor function que retorna el valor numérico directamente
  (row: Product) => parsePriceToNumber(row.price),
  {
    id: "price",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    // No necesita sortingFn personalizada porque ya retorna número
    cell: (info) => {
      const originalPrice = info.row.original.price;

      return (
        <div className="text-muted-foreground text-end">
          {formatPrice(originalPrice)}
        </div>
      );
    },
    meta: {
      label: "Precio",
    },
  }
);

// Función para obtener configuración completa de precio
const getPriceConfig = (price: number): PriceConfig => {
  if (price >= 100) {
    return {
      variant: "default",
      label: "Premium",
      className: "text-green-700 bg-green-50 border-green-200",
    };
  }
  if (price >= 50) {
    return {
      variant: "secondary",
      label: "Estándar",
      className: "text-blue-700 bg-blue-50 border-blue-200",
    };
  }
  return {
    variant: "outline",
    label: "Económico",
    className: "text-gray-700 bg-gray-50 border-gray-200",
  };
};

// OPCIÓN 3: Con agrupación por rangos de precio (AVANZADA)
export const priceColumnWithRanges = columnHelper.accessor(
  (row: Product): number => parsePriceToNumber(row.price),
  {
    id: "price",
    header: () => (
      <div className="flex items-center gap-2 justify-end">
        <DollarSign className="w-4 h-4" />
        Precio
      </div>
    ),
    cell: (info) => {
      const numericPrice = info.getValue();
      const originalPrice = info.row.original.price;
      const config = getPriceConfig(numericPrice);

      return (
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant={config.variant}
            className={`font-mono ${config.className}`}
          >
            {formatPrice(originalPrice)}
          </Badge>
          <span className="text-xs text-muted-foreground">{config.label}</span>
        </div>
      );
    },
    // Función de agrupación opcional
    getGroupingValue: (row: Product): string => {
      const price = parsePriceToNumber(row.price);
      if (price >= 100) return "Premium ($100+)";
      if (price >= 50) return "Estándar ($50-$99)";
      return "Económico (<$50)";
    },
    meta: {
      className: "text-right",
    },
  }
);

// Custom sorting function para precios
const priceSortingFn: SortingFn<Product> = (rowA, rowB, columnId) => {
  const a = parsePriceToNumber(rowA.getValue(columnId));
  const b = parsePriceToNumber(rowB.getValue(columnId));
  return a - b;
};

// Custom filter function para rangos de precio
const priceRangeFilter: FilterFn<Product> = (
  row,
  columnId,
  filterValue: [number, number]
) => {
  if (!filterValue || filterValue.length !== 2) return true;
  const [min, max] = filterValue;
  const price = parsePriceToNumber(row.getValue(columnId));
  return price >= min && price <= max;
};

// Configuraciones recomendadas
export const priceTableConfig = {
  // Para mejor performance en datasets grandes
  enableSorting: true,
  enableGlobalFilter: true,
  sortingFns: {
    // Función de sorting personalizada disponible globalmente
    price: priceSortingFn,
  },
  filterFns: {
    priceRange: priceRangeFilter,
  },
} as const;

// Utilidades exportadas con tipos
export const priceUtils = {
  parsePriceToNumber,
  formatPrice,
  getPriceConfig,
  getPriceVariant,
  getPriceColor,

  // Función para filtrar por rango de precio
  filterByPriceRange: (
    rows: Row<Product>[],
    columnId: string,
    filterValue: [number, number]
  ): Row<Product>[] => {
    if (!filterValue || filterValue.length !== 2) return rows;
    const [min, max] = filterValue;

    return rows.filter((row) => {
      const price = parsePriceToNumber(row.getValue(columnId));
      return price >= min && price <= max;
    });
  },

  // Función para obtener estadísticas de precios
  getPriceStats: (products: Product[]) => {
    const prices = products.map((p) => parsePriceToNumber(p.price));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
    };
  },

  // Función para agrupar productos por rango de precio
  groupByPriceRange: (products: Product[]) => {
    return products.reduce((groups, product) => {
      const price = parsePriceToNumber(product.price);
      const range = getPriceConfig(price).label;
      if (!groups[range]) groups[range] = [];
      groups[range].push(product);
      return groups;
    }, {} as Record<PriceRange, Product[]>);
  },
} as const;
