import {
  AppHeader,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/section"
import { CreateOrderForm } from "../form"

export default function OrdersCreatePage() {
  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppHeaderSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb
            items={[
              { type: "link", label: "Orders", href: "/orders" },
              { type: "page", label: "New" },
            ]}
          />
        </AppHeaderContent>
      </AppHeader>
      <SectionGroup className="mx-auto w-full max-w-2xl">
        <Section>
          <SectionHeader>
            <SectionTitle>Create Order</SectionTitle>
            <SectionDescription>
              Choose a customer, add products, and review the order before
              saving.
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <CreateOrderForm />
          </SectionContent>
        </Section>
      </SectionGroup>
    </>
  )
}
