import { Product } from "@workspace/api-client"
import { createColumnConfigHelper } from "@workspace/data-table/filters"
import {
  CalendarIcon,
  CircleDotDashedIcon,
  DollarSignIcon,
  PercentIcon,
  StarIcon,
  TagIcon,
  TextIcon,
  WarehouseIcon,
} from "lucide-react"
import { featuredIcons } from "../_components/product-columns"
import { productStatusOptions } from "./product-status"

const dtf = createColumnConfigHelper<Product>()

// The column ids are the API params; the operator suffixes come from
// `toQueryParams`. Category and brand options come from the API, so
// `ProductsTable` passes them to `useDataTableFilters`.
export const productFilterColumns = [
  dtf
    .text()
    .id("name")
    .accessor((row) => row.name)
    .displayName("Name")
    .icon(TextIcon)
    .build(),
  dtf
    .option()
    .id("status")
    .accessor((row) => row.status ?? "")
    .displayName("Status")
    .icon(CircleDotDashedIcon)
    .options(productStatusOptions)
    .build(),
  dtf
    .option()
    .id("featured")
    .accessor((row) => String(row.featured ?? false))
    .displayName("Featured")
    .icon(StarIcon)
    .options([
      { label: "Featured", value: "true", icon: featuredIcons.true },
      { label: "Not featured", value: "false", icon: featuredIcons.false },
    ])
    .build(),
  dtf
    .option()
    .id("category")
    .accessor((row) => row.category?.slug ?? "")
    .displayName("Category")
    .icon(TagIcon)
    .build(),
  dtf
    .option()
    .id("brand")
    .accessor((row) => row.brand?.slug ?? "")
    .displayName("Brand")
    .icon(WarehouseIcon)
    .build(),
  dtf
    .number()
    .id("price")
    .accessor((row) => row.price ?? 0)
    .displayName("Price")
    .icon(DollarSignIcon)
    .build(),
  dtf
    .number()
    .id("discount_percent")
    .accessor((row) => row.discount_percent ?? 0)
    .displayName("Discount")
    .icon(PercentIcon)
    .min(0)
    .max(100)
    .build(),
  dtf
    .date()
    .id("created_at")
    .accessor((row) => new Date(row.created_at))
    .displayName("Created")
    .icon(CalendarIcon)
    .build(),
] as const
