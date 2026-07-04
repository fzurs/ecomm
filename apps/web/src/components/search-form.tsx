"use client"
import { SearchIcon } from "lucide-react"

import Form from "next/form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { debounce, parseAsString, useQueryState } from "nuqs"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function SearchForm() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: false })
  )

  return (
    <Form action="/products">
      <InputGroup className="h-8">
        <InputGroupInput
          placeholder="Search for products..."
          id="search"
          name="search"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value, {
              // Send immediate update if resetting, otherwise debounce at 500ms
              limitUrlUpdates:
                e.target.value === "" ? undefined : debounce(500),
            })
          }
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
    </Form>
  )
}

export function SearchFormSkeleton () {
  return <Skeleton className="h-8 min-w-52 w-auto" />
}