import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useId, useLayoutEffect, useRef, useState } from "react"

/**
 * The description clamped to a few lines, with a toggle only when it overflows.
 * Line breaks typed in the form are kept.
 */
export function ProductDescription({ description }: { description: string }) {
  const id = useId()
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  // Measured only while clamped: expanded, the text never overflows, and the
  // toggle has to stay to collapse it again. The observer catches resizes.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const observer = new ResizeObserver(() =>
      setOverflows(el.scrollHeight > el.clientHeight)
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded, description])

  return (
    <div className="flex max-w-prose flex-col items-start gap-1">
      <p
        id={id}
        ref={ref}
        className={cn(
          "text-pretty whitespace-pre-line text-muted-foreground",
          !expanded && "line-clamp-4"
        )}
      >
        {description}
      </p>
      {(overflows || expanded) && (
        <Button
          variant="link"
          size="sm"
          className="px-0"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  )
}
