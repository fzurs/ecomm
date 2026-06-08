import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

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
        <ThemeProvider>
          <div className="[--header-height:calc(--spacing(12))]">
            <SidebarProvider className="flex flex-col">
              <SiteHeader />
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset>{children}</SidebarInset>
              </div>
            </SidebarProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
