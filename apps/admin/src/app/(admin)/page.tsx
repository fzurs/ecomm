import {
  AppHeader,
  AppHeaderActions,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"
import { ModeToggle } from "@workspace/ui/components/mode-toggle"

export default function Page() {
  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppHeaderSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb items={[{ type: "page", label: "Home" }]} />
        </AppHeaderContent>
        <AppHeaderActions>
          <ModeToggle />
        </AppHeaderActions>
      </AppHeader>
    </>
  )
}
