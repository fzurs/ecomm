import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"
import { AlertTriangleIcon } from "lucide-react"

export function OutOfStockAlert({
  className,
  ...props
}: React.ComponentProps<typeof Alert>) {
  return (
    <Alert
      className={cn(
        "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50",
        className
      )}
      {...props}
    >
      <AlertTriangleIcon />
      <AlertTitle>Out of stock</AlertTitle>
      <AlertDescription>
        This product is currently out of stock. Please check out other options.
      </AlertDescription>
    </Alert>
  )
}
