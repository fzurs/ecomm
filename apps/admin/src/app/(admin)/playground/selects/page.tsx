"use client"

import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { useState } from "react"
import { CustomerSelect } from "../../orders/_components/customer-select"
import { BrandSelect } from "../../products/_components/brand-select"
import { CategorySelect } from "../../products/_components/category-select"
import {
  PlaygroundSection,
  PlaygroundValue,
} from "../_components/playground-section"

export default function SelectsPlaygroundPage() {
  const [category, setCategory] = useState<number | null>(null)
  const [brand, setBrand] = useState<number | null>(null)
  const [customer, setCustomer] = useState<number>(-1)

  return (
    <>
      <AppHeader>
        <AppHeaderNav
          parents={[{ label: "Playground", href: "/playground" }]}
          page="Selects"
        />
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-8 px-4 py-6 lg:px-6">
        <PlaygroundSection
          title="CategorySelect"
          description="Product form. Shows each category's description."
        >
          <div className="w-full max-w-xs">
            <CategorySelect value={category} onValueChange={setCategory} />
          </div>
          <PlaygroundValue value={category} />
        </PlaygroundSection>
        <PlaygroundSection title="BrandSelect" description="Product form.">
          <div className="w-full max-w-xs">
            <BrandSelect value={brand} onValueChange={setBrand} />
          </div>
          <PlaygroundValue value={brand} />
        </PlaygroundSection>
        <PlaygroundSection
          title="CustomerSelect"
          description="Order form. -1 means no customer."
        >
          <CustomerSelect
            value={customer}
            onValueChange={(value) => setCustomer(value ?? -1)}
          />
          <PlaygroundValue value={customer} />
        </PlaygroundSection>
      </main>
    </>
  )
}
