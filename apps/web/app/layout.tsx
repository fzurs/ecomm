import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { NuqsAdapter } from "nuqs/adapters/next"
import { Suspense } from "react"

export const metadata = {
  title: "Sitio web eccomerce",
  description: "Sitio web oficial para el eccomerce de la empresa",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <ThemeProvider>
            <div className="[--header-height:calc(--spacing(12))]">
              <SidebarProvider className="flex flex-col">
                <Suspense>{children}</Suspense>
              </SidebarProvider>
            </div>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
