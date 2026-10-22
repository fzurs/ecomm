import { cn } from "@workspace/ui/lib/utils"

/** A titled preview area for one component or variant. */
export function PlaygroundSection({
  title,
  description,
  className,
  children,
}: {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-medium">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div
        className={cn(
          "flex flex-wrap items-start gap-4 rounded-lg border bg-background p-6",
          className
        )}
      >
        {children}
      </div>
    </section>
  )
}

/** Shows a value next to the preview, e.g. the selected id of a select. */
export function PlaygroundValue({ value }: { value: unknown }) {
  return (
    <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
      {JSON.stringify(value)}
    </code>
  )
}
