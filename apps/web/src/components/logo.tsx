import { cn } from "cn"
import { Command } from "lucide-react"
import Link from "next/link"

/** The store's name and mark, linking to the home page. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 font-semibold",
        className
      )}
    >
      <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Command className="size-4" />
      </div>
      Acme Store
    </Link>
  )
}
