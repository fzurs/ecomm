import { cn } from "cn"
import { ImageIcon } from "lucide-react"

/**
 * A product's image, square (the catalog's are 800×800) and whole, or a
 * placeholder when it has none.
 */
export function ProductImage({
  src,
  alt,
  className,
  ...props
}: Omit<React.ComponentProps<"img">, "src"> & {
  src: string | null | undefined
  alt: string
}) {
  const frame = cn(
    "aspect-square w-full overflow-hidden rounded-lg bg-muted",
    className
  )
  if (!src) {
    return (
      <div className={cn(frame, "flex items-center justify-center")}>
        <ImageIcon className="size-10 text-muted-foreground" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }
  return (
    // The images come from Django's media, which next/image would have to
    // fetch on this server (docs/production.md, "Media").
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(frame, "object-contain")}
      {...props}
    />
  )
}
