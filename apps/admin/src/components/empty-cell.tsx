import { cn } from "@workspace/ui/lib/utils"

/** A muted dash for table cells without a value; `label` is announced instead of it. */
export function EmptyCell({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <>
      <span aria-hidden className={cn("text-muted-foreground", className)}>
        —
      </span>
      {label && <span className="sr-only">{label}</span>}
    </>
  )
}
