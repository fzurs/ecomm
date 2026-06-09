"use client"
import { Search } from "lucide-react"

import { Label } from "@workspace/ui/components/label"
import { SidebarInput } from "@workspace/ui/components/sidebar"
import { parseAsString, useQueryState } from "nuqs"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: false })
  )

  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Search for a Product..."
          className="h-8 pl-7"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}
