import { Badge } from "@workspace/ui/components/badge"
import { cn } from "cn"

export type StatusColor =
  | "gray"
  | "amber"
  | "blue"
  | "violet"
  | "green"
  | "orange"
  | "red"

/** What each resource defines per status, in `_lib/<resource>-status`. */
export type StatusDefinition = { label: string; color: StatusColor }

// Full class names, so Tailwind finds them.
const dotColors: Record<StatusColor, string> = {
  gray: "bg-zinc-400 dark:bg-zinc-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
}

/** The status color as a dot. Decorative: the label always goes next to it. */
export function StatusDot({
  color,
  className,
}: {
  color: StatusColor
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full",
        dotColors[color],
        className
      )}
    />
  )
}

export function StatusBadge({
  label,
  color,
  ...props
}: React.ComponentProps<typeof Badge> & StatusDefinition) {
  return (
    <Badge variant="outline" {...props}>
      <StatusDot color={color} />
      {label}
    </Badge>
  )
}

/**
 * The options for selects, menus and filters, in the given order (the API's,
 * from `zXStatus.options`), with the dot as icon.
 */
export function statusOptions<T extends string>(
  values: readonly T[],
  statuses: Record<T, StatusDefinition>
) {
  return values.map((value) => ({
    value,
    label: statuses[value].label,
    icon: <StatusDot color={statuses[value].color} />,
  }))
}
