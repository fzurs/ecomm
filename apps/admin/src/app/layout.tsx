import { ReactQueryProvider } from "@/components/react-query-provider"
import "@workspace/ui/globals.css"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { Outfit, Geist_Mono } from "next/font/google"

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <ThemeProvider>
          <NuqsAdapter>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
