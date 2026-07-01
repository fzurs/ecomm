import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Trash2Icon } from "lucide-react"
import * as React from "react"

const ImagePreviewContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

export function useImagePreview() {
  const context = React.useContext(ImagePreviewContext)
  if (!context) throw "useImagePreview needs a provider"
  const { setOpen, ...props } = context
  return { toggleOpen: () => setOpen((open) => !open), setOpen, ...props }
}

export function ImagePreview({
  children,
  ...props
}: React.ComponentProps<"div">) {
  const [open, setOpen] = React.useState(true)

  return (
    <ImagePreviewContext value={{ open, setOpen }}>
      <div className="relative" {...props}>
        {open ? children : null}
      </div>
    </ImagePreviewContext>
  )
}

export function ImagePreviewClose({
  children,
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleOpen } = useImagePreview()
  return (
    <Button
      size="icon-sm"
      variant="secondary"
      className={cn("absolute inset-full -m-1 -translate-full", className)}
      onClick={(event) => {
        toggleOpen()
        onClick?.(event)
      }}
      {...props}
    >
      {children ?? <Trash2Icon />}
    </Button>
  )
}
