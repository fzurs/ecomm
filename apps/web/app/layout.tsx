import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { NuqsAdapter } from "nuqs/adapters/next"
import { getAllBrands, getAllCategories } from "@/lib/cache"
import { Outfit, Geist_Mono } from "next/font/google"
import CategoriesProvider from "@/components/categories-provider"
import BrandsProvider from "@/components/brands-provider"

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <ThemeProvider>
          <NuqsAdapter>
            <div className="[--header-height:calc(--spacing(12))]">
              <SidebarProvider className="flex flex-col">
                <CategoriesProvider categoriesPromise={categoriesPromise}>
                  <BrandsProvider brandsPromise={brandsPromise}>
                    {children}
                  </BrandsProvider>
                </CategoriesProvider>
              </SidebarProvider>
            </div>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
