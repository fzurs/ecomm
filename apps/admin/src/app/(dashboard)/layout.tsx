import { redirect } from "next/navigation";

import { getUser } from "@/lib/query-options.auth";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user?.is_staff) redirect("/login");

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar collapsible="icon" variant="sidebar" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
