import { Suspense } from "react"
import { Logo } from "./logo"
import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { SearchForm, SearchFormSkeleton } from "./search-form"
import { UserNav } from "./user-nav"

// On a phone the search takes a row of its own, below the menu and the logo.
const searchClassName =
  "order-last w-full sm:order-none sm:ml-auto sm:w-64 lg:w-80"

/** The shop's header: the menu, the search and the account. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 lg:px-6">
        <MobileNav className="-ml-2 md:hidden" />
        <Logo />
        <MainNav className="ml-4 hidden md:flex" />
        <Suspense fallback={<SearchFormSkeleton className={searchClassName} />}>
          <SearchForm className={searchClassName} />
        </Suspense>
        <div className="ml-auto flex items-center sm:ml-0">
          <UserNav />
        </div>
      </div>
    </header>
  )
}
