import {
  Trace,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@workspace/ui/components/trace"
import {
  ChartColumnIcon,
  LayoutGridIcon,
  LoaderCircleIcon,
  type LucideIcon,
  PackageIcon,
  PackageXIcon,
  ReceiptTextIcon,
  SearchIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersRoundIcon,
} from "lucide-react"
import type { ReplyStep } from "./use-conversation"

type Tool = { icon: LucideIcon; running: string; done: string; failed: string }

// The same icons as the sidebar's sections. null hides the tool: naming the
// conversation isn't part of the answer.
const TOOLS: Record<string, Tool | null> = {
  search_orders: {
    icon: ShoppingCartIcon,
    running: "Searching orders",
    done: "Searched orders",
    failed: "Couldn't search orders",
  },
  get_order: {
    icon: ShoppingCartIcon,
    running: "Reading the order",
    done: "Read the order",
    failed: "Couldn't read the order",
  },
  search_products: {
    icon: PackageIcon,
    running: "Searching products",
    done: "Searched products",
    failed: "Couldn't search products",
  },
  unsold_products: {
    icon: PackageXIcon,
    running: "Looking for unsold products",
    done: "Looked for unsold products",
    failed: "Couldn't look for unsold products",
  },
  list_categories: {
    icon: LayoutGridIcon,
    running: "Listing categories",
    done: "Listed categories",
    failed: "Couldn't list categories",
  },
  list_brands: {
    icon: TagIcon,
    running: "Listing brands",
    done: "Listed brands",
    failed: "Couldn't list brands",
  },
  search_customers: {
    icon: UsersRoundIcon,
    running: "Searching customers",
    done: "Searched customers",
    failed: "Couldn't search customers",
  },
  get_customer: {
    icon: UsersRoundIcon,
    running: "Reading the customer",
    done: "Read the customer",
    failed: "Couldn't read the customer",
  },
  sales_summary: {
    icon: ChartColumnIcon,
    running: "Summing up sales",
    done: "Summed up sales",
    failed: "Couldn't sum up sales",
  },
  list_invoices: {
    icon: ReceiptTextIcon,
    running: "Searching invoices",
    done: "Searched invoices",
    failed: "Couldn't search invoices",
  },
  get_invoice: {
    icon: ReceiptTextIcon,
    running: "Reading the invoice",
    done: "Read the invoice",
    failed: "Couldn't read the invoice",
  },
  set_title: null,
}

// A tool added to the API before it gets a label here.
const UNKNOWN_TOOL: Tool = {
  icon: SearchIcon,
  running: "Looking it up",
  done: "Looked it up",
  failed: "Couldn't look it up",
}

/**
 * What the answer did, above its text: a line per tool it called and, while
 * nothing else shows progress, "Thinking".
 */
export function AssistantSteps({
  steps,
  thinking,
}: {
  steps: ReplyStep[]
  thinking: boolean
}) {
  const lines = steps.flatMap((step) => {
    const tool =
      TOOLS[step.name] === undefined ? UNKNOWN_TOOL : TOOLS[step.name]
    return tool ? [{ ...tool, status: step.status }] : []
  })
  if (!lines.length && !thinking) return null

  return (
    <Trace>
      {lines.map((line, index) => (
        <TraceLine
          key={index}
          status={line.status === "done" ? undefined : line.status}
        >
          <TraceIcon>
            <line.icon />
          </TraceIcon>
          <TraceTitle>
            {line.status === "error" ? line.failed : line[line.status]}
          </TraceTitle>
        </TraceLine>
      ))}
      {thinking && (
        <TraceLine status="running">
          <TraceIcon>
            <LoaderCircleIcon className="animate-spin" />
          </TraceIcon>
          <TraceTitle>Thinking</TraceTitle>
        </TraceLine>
      )}
    </Trace>
  )
}
