import { capitalize } from "@/lib/utils"
import { OrderStatus } from "@workspace/api-client"
import { zOrderStatus } from "@workspace/api-client/zod"

export const orderStatusClasses: Record<
  OrderStatus,
  { badge: string; focus: string }
> = {
  pending: {
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    focus:
      "focus:bg-amber-100 focus:text-amber-800 dark:focus:bg-amber-500/25 dark:focus:text-amber-400",
  },
  paid: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
    focus:
      "focus:bg-blue-100 focus:text-blue-800 dark:focus:bg-blue-500/25 dark:focus:text-blue-400",
  },
  shipped: {
    badge:
      "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
    focus:
      "focus:bg-violet-100 focus:text-violet-800 dark:focus:bg-violet-500/25 dark:focus:text-violet-400",
  },
  delivered: {
    badge:
      "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
    focus:
      "focus:bg-green-100 focus:text-green-800 dark:focus:bg-green-500/25 dark:focus:text-green-400",
  },
  cancelled: {
    badge: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
    focus:
      "focus:bg-red-100 focus:text-red-800 dark:focus:bg-red-500/25 dark:focus:text-red-400",
  },
}

export const orderStatusOptions = zOrderStatus.options.map((status) => ({
  label: capitalize(status.replaceAll("_", " ")),
  value: status,
}))
