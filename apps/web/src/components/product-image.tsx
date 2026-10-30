import { cn } from "cn"
import { ImageIcon } from "lucide-react"
import Image from "next/image"

/**
 * A product's image, square (the catalog's are 800×800) and whole, or a
 * placeholder when it has none. next/image resizes it to `sizes`: how wide it
 * shows, e.g. "48px" in a summary or "50vw" on the product's page.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  preload,
  className,
}: {
  src: string | null | undefined
  alt: string
  sizes: string
  /** The page's main image: loaded first, not lazily. */
  preload?: boolean
  className?: string
}) {
  const frame = cn(
    "relative aspect-square w-full overflow-hidden rounded-lg bg-muted",
    className
  )
  if (!src) {
    return (
      <div className={cn(frame, "flex items-center justify-center")}>
        <ImageIcon className="size-1/3 text-muted-foreground" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }
  return (
    <div className={frame}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-contain"
      />
    </div>
  )
}
