"use client"
import { SearchIcon } from "lucide-react"

import Form from "next/form"
import { usePathname } from "next/navigation"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { debounce, useQueryStates } from "nuqs"
import { Skeleton } from "@workspace/ui/components/skeleton"
import * as React from "react"
import { productParams } from "@/lib/product-params"

/**
 * On a page that lists products (`live`), typing filters them: the `search`
 * param of the URL, which the page reads on the server. Anywhere else, Enter
 * searches the whole catalog on the home page.
 */
export function SearchForm({ live = false }: { live?: boolean }) {
  const pathname = usePathname()
  const [{ search }, setParams] = useQueryStates(
    { search: productParams.search, page: productParams.page },
    { shallow: false }
  )
  const [draft, setDraft] = React.useState("")

  return (
    <Form action={live ? pathname : "/"}>
      <InputGroup className="h-8">
        <InputGroupInput
          placeholder="Search for products..."
          id="search"
          name="search"
          type="search"
          aria-label="Search products"
          value={live ? search : draft}
          onChange={(e) => {
            if (!live) return setDraft(e.target.value)
            // A new search starts on the first page.
            setParams(
              { search: e.target.value, page: null },
              {
                // Send immediate update if resetting, otherwise debounce at 500ms
                limitUrlUpdates:
                  e.target.value === "" ? undefined : debounce(500),
              }
            )
          }}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
    </Form>
  )
}

export function SearchFormSkeleton() {
  return <Skeleton className="h-8 w-auto min-w-52" />
}
