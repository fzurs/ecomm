"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import * as React from "react";

import { userDetailsQueryOptions } from "@/lib/queries";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { data: user, isLoading, isError } = useQuery(userDetailsQueryOptions);

  React.useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  if (isError || isLoading || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar collapsible="icon" user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
