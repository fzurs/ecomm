"use client"
import { AvatarImage } from "@workspace/ui/components/avatar"
import { getImageProps } from "next/image"
import type * as React from "react"

/**
 * An `AvatarImage` of Django's media (a product's or a customer's image) at
 * the size it shows, in px: next/image's resized `src` and `srcSet` (1x, 2x)
 * instead of the original, 800×800 for a product. Not an <Image>: Base UI
 * preloads `src` to choose between it and the fallback, so `src` itself has
 * to be the small one.
 */
export function MediaAvatarImage({
  src,
  size,
  ...props
}: Omit<React.ComponentProps<typeof AvatarImage>, "src" | "srcSet"> & {
  src: string
  size: number
}) {
  const { props: image } = getImageProps({
    src,
    alt: "",
    width: size,
    height: size,
  })
  return <AvatarImage src={image.src} srcSet={image.srcSet} {...props} />
}
