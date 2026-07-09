import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { NuqsAdapter } from "nuqs/adapters/next"
import { getAllBrands, getAllCategories } from "@/lib/cache"
import CategoriesProvider from "@/components/categories-provider"
import BrandsProvider from "@/components/brands-provider"
import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata = {
  title: "Sitio web eccomerce",
  description: "Sitio web oficial para el eccomerce de la empresa",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categoriesPromise = getAllCategories()
  const brandsPromise = getAllBrands()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NuqsAdapter>
            <SidebarProvider className="flex flex-col">
              <CategoriesProvider categoriesPromise={categoriesPromise}>
                <BrandsProvider brandsPromise={brandsPromise}>
                  <div className="flex flex-1 [--header-height:calc(--spacing(12))]">
                    <AppSidebar />
                    <SidebarInset className="mt-(--header-height)">
                      <Suspense>{children}</Suspense>
                    </SidebarInset>
                  </div>
                </BrandsProvider>
              </CategoriesProvider>
            </SidebarProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
