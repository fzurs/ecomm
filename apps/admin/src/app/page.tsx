import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <PageHeader>
      <PageTitle>Home</PageTitle>
      <PageAction>
        <Button size="sm">Quick create !!!</Button>
      </PageAction>
    </PageHeader>
  )
}
