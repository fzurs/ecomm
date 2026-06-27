import {
  PageHeader,
  PageHeaderAction,
  PageHeaderHeading,
} from "@/components/page-header"
import { ModeToggle } from "@workspace/ui/components/mode-toggle"

export default function Page() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Home</PageHeaderHeading>
        <PageHeaderAction>
          <ModeToggle />
        </PageHeaderAction>
      </PageHeader>
    </>
  )
}
