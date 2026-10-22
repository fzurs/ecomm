import { AppHeader, AppHeaderNav } from "@/components/app-header"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui/components/item"
import Link from "next/link"
import { playgroundEntries } from "./_lib/playground-entries"

export default function PlaygroundPage() {
  return (
    <>
      <AppHeader>
        <AppHeaderNav page="Playground" />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="typeset">
          <h1>Playground</h1>
          <p className="text-muted-foreground">
            Build and review components in isolation, with the real providers
            and API data. Only available in development.
          </p>
        </div>
        <ItemGroup className="max-w-2xl gap-2">
          {playgroundEntries.map((entry) => (
            <Item
              key={entry.slug}
              variant="outline"
              render={<Link href={`/playground/${entry.slug}`} />}
            >
              <ItemContent>
                <ItemTitle>{entry.title}</ItemTitle>
                <ItemDescription>{entry.description}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </main>
    </>
  )
}
