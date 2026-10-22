import { capitalize } from "@/lib/utils"
import { OrderStatus } from "@workspace/api-client"
import { zOrderStatus } from "@workspace/api-client/zod"

// `focus` colors a highlighted dropdown menu item and `highlight` a highlighted combobox
// item (Base UI marks it with data-highlighted, not focus). Tailwind only ships classes
// written out in full, so they can't be derived from each other.
export const orderStatusClasses: Record<
  OrderStatus,
  { badge: string; focus: string; highlight: string }
> = {
  pending: {
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    focus:
      "focus:bg-amber-100 focus:text-amber-800 dark:focus:bg-amber-500/25 dark:focus:text-amber-400",
    highlight:
      "data-highlighted:bg-amber-100 data-highlighted:text-amber-800 dark:data-highlighted:bg-amber-500/25 dark:data-highlighted:text-amber-400",
  },
  paid: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
    focus:
      "focus:bg-blue-100 focus:text-blue-800 dark:focus:bg-blue-500/25 dark:focus:text-blue-400",
    highlight:
      "data-highlighted:bg-blue-100 data-highlighted:text-blue-800 dark:data-highlighted:bg-blue-500/25 dark:data-highlighted:text-blue-400",
  },
  shipped: {
    badge:
      "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
    focus:
      "focus:bg-violet-100 focus:text-violet-800 dark:focus:bg-violet-500/25 dark:focus:text-violet-400",
    highlight:
      "data-highlighted:bg-violet-100 data-highlighted:text-violet-800 dark:data-highlighted:bg-violet-500/25 dark:data-highlighted:text-violet-400",
  },
  delivered: {
    badge:
      "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
    focus:
      "focus:bg-green-100 focus:text-green-800 dark:focus:bg-green-500/25 dark:focus:text-green-400",
    highlight:
      "data-highlighted:bg-green-100 data-highlighted:text-green-800 dark:data-highlighted:bg-green-500/25 dark:data-highlighted:text-green-400",
  },
  cancelled: {
    badge: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
    focus:
      "focus:bg-red-100 focus:text-red-800 dark:focus:bg-red-500/25 dark:focus:text-red-400",
    highlight:
      "data-highlighted:bg-red-100 data-highlighted:text-red-800 dark:data-highlighted:bg-red-500/25 dark:data-highlighted:text-red-400",
  },
}

export const orderStatusOptions = zOrderStatus.options.map((status) => ({
  label: capitalize(status.replaceAll("_", " ")),
  value: status,
}))
