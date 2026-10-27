import { Invoice } from "@workspace/api-client"
import { createColumnConfigHelper } from "@workspace/data-table/filters"
import {
  CalendarIcon,
  CircleDotDashedIcon,
  DollarSignIcon,
  FileTextIcon,
  UserIcon,
} from "lucide-react"
import { invoiceStatusOptions } from "./invoice-status"
import { voucherTypeOptions } from "./voucher-type"

const dtf = createColumnConfigHelper<Invoice>()

// The column ids are the API params; the operator suffixes come from
// `toQueryParams`. Customer options come from the API, so the invoices page
// passes them to `useDataTableFilters`. Text goes through the search box.
export const invoiceFilterColumns = [
  dtf
    .option()
    .id("status")
    .accessor((row) => row.status)
    .displayName("Status")
    .icon(CircleDotDashedIcon)
    .options(invoiceStatusOptions)
    .build(),
  dtf
    .option()
    .id("voucher_type")
    .accessor((row) => String(row.voucher_type))
    .displayName("Type")
    .icon(FileTextIcon)
    .options(voucherTypeOptions)
    .build(),
  dtf
    .option()
    .id("customer")
    .accessor((row) => String(row.customer.id))
    .displayName("Customer")
    .icon(UserIcon)
    .build(),
  dtf
    .number()
    .id("total_amount")
    .accessor((row) => Number(row.total_amount))
    .displayName("Total")
    .icon(DollarSignIcon)
    .build(),
  dtf
    .date()
    .id("issue_date")
    .accessor((row) => (row.issue_date ? new Date(row.issue_date) : undefined))
    .displayName("Issued")
    .icon(CalendarIcon)
    .build(),
] as const
