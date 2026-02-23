import "@workspace/ui/globals.css"
import { ThemeProvider } from "@workspace/ui/components/theme-provider";

export const metadata = {
  title: "Sitio web official para el eccomerce de la empresa de ferreteria",
  description: "Sitio web oficial para el eccomerce de la empresa de ferreteria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
