import { AppHeader, AppHeaderNav } from "@/components/app-header"
import {
  Section,
  SectionContent,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/section"
import { CreateOrderForm } from "../form"

export default function OrdersCreatePage() {
  return (
    <>
      <AppHeader>
        <AppHeaderNav
          items={[
            { type: "link", label: "Orders", href: "/orders" },
            { type: "page", label: "New" },
          ]}
        />
      </AppHeader>
      <SectionGroup className="mx-auto w-full max-w-2xl">
        <Section>
          <SectionHeader>
            <SectionTitle>Create Order</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <CreateOrderForm />
          </SectionContent>
        </Section>
      </SectionGroup>
    </>
  )
}
