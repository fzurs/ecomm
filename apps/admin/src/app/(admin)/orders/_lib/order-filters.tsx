import { Order } from "@workspace/api-client"
import { createColumnConfigHelper } from "@workspace/data-table/filters"
import {
  CalendarIcon,
  CircleDotDashedIcon,
  DollarSignIcon,
  FileTextIcon,
  UserIcon,
} from "lucide-react"
import { orderInvoiceStatusOptions } from "./order-invoice-status"
import { orderStatusOptions } from "./order-status"

const dtf = createColumnConfigHelper<Order>()

// The column ids are the API params; the operator suffixes come from
// `toQueryParams`. Customer options come from the API, so the orders page
// passes them to `useDataTableFilters`. Text goes through the search box.
export const orderFilterColumns = [
  dtf
    .option()
    .id("status")
    .accessor((row) => row.status ?? "")
    .displayName("Status")
    .icon(CircleDotDashedIcon)
    .options(orderStatusOptions)
    .build(),
  dtf
    .option()
    .id("invoice_status")
    .accessor((row) => row.invoice_status)
    .displayName("Invoice")
    .icon(FileTextIcon)
    .options(orderInvoiceStatusOptions)
    .build(),
  dtf
    .option()
    .id("customer")
    .accessor((row) => String(row.customer))
    .displayName("Customer")
    .icon(UserIcon)
    .build(),
  dtf
    .number()
    .id("total")
    .accessor((row) => row.total)
    .displayName("Total")
    .icon(DollarSignIcon)
    .build(),
  dtf
    .date()
    .id("created_at")
    .accessor((row) => new Date(row.created_at))
    .displayName("Created")
    .icon(CalendarIcon)
    .build(),
] as const
