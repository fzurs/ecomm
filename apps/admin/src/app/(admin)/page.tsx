import { AppHeader, AppHeaderNav } from "@/components/app-header"

export default function Page() {
  return (
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Home" }]} />
      </AppHeader>
    </>
  )
}
