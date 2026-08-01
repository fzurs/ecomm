import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { ModeToggle } from "@workspace/ui/components/mode-toggle"

export default function Page() {
  return (
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Home" }]} />
        <AppHeaderActions>
          <ModeToggle />
        </AppHeaderActions>
      </AppHeader>
    </>
  )
}
