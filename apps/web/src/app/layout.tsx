import "@workspace/ui/globals.css"
import { Toaster } from "@workspace/ui/components/sonner"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Inter } from "next/font/google"
import { cn } from "cn"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: { default: "Acme Store", template: "%s · Acme Store" },
  description: "The official Acme online store",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
