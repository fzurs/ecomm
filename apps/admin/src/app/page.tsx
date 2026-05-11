"use client"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { getCategoryQueryOptions } from "@/lib/query-options"
import { useQueries } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { useEffect } from "react"

export default function Page() {
  const currentItems = useQueries({
    queries: [1].map((n) => getCategoryQueryOptions({ id: n })),
  })
    .map(({ data }) => data)
    .filter((data) => !!data)

  useEffect(() => {
    console.log(currentItems)
  }, [currentItems])

  return (
    <PageHeader>
      <PageTitle>{currentItems.map((item) => item.name)}</PageTitle>
      <PageAction>
        <Button size="sm">Quick create !!!</Button>
      </PageAction>
    </PageHeader>
  )
}
