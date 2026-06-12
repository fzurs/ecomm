import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { NuqsAdapter } from "nuqs/adapters/next"
import { SidebarItemsProvider } from "@/components/sidebar-items-provider"
import { apiClient } from "@/lib/api-client"
import { Suspense } from "react"

export const metadata = {
  title: "Sitio web eccomerce",
  description: "Sitio web oficial para el eccomerce de la empresa",
}

async function getSidebarItems() {
  "use cache"
  const categories = await apiClient.categories_list()
  const brands = await apiClient.brands_list()
  const featuredProducts = await apiClient
    .products_list({
      queries: { featured: true },
    })
    .then((data) => data.results)
  return { categories, brands, featuredProducts }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const itemsPromise = getSidebarItems()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <ThemeProvider>
            <div className="[--header-height:calc(--spacing(12))]">
              <SidebarProvider className="flex flex-col">
                <SidebarItemsProvider itemsPromise={itemsPromise}>
                  <Suspense>{children}</Suspense>
                </SidebarItemsProvider>
              </SidebarProvider>
            </div>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
