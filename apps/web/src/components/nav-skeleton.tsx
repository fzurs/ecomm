import { SidebarMenuItem } from "@workspace/ui/components/sidebar"
import { Skeleton } from "@workspace/ui/components/skeleton"

// Fixed widths: the ui's SidebarMenuSkeleton picks random ones, which differ
// between the server's render and the browser's.
const widths = ["w-3/4", "w-1/2", "w-2/3"]

/** The sidebar's menu while its items load. */
export function NavSkeleton() {
  return widths.map((width) => (
    <SidebarMenuItem key={width} className="flex h-8 items-center px-2">
      <Skeleton className={`h-4 ${width}`} />
    </SidebarMenuItem>
  ))
}
