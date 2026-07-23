import {
  AppHeader,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"

import { CreateOrderForm } from "../form"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/section"
import { Card, CardContent } from "@workspace/ui/components/card"

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
      <SectionGroup>
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
