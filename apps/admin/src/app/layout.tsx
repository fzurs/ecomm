import { ReactQueryProvider } from "@/components/react-query-provider"
import "@workspace/ui/globals.css"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NuqsAdapter>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
