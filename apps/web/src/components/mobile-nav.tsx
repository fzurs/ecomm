"use client"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "cn"
import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useBrands } from "./brands-provider"
import { brandHref } from "@/lib/product-params"
import { useCategories } from "./categories-provider"

/** The header's menu on a phone: a sheet with categories, brands and the account. */
export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>Acme Store</SheetTitle>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-6 p-4">
            <Section title="Shop">
              <NavLink href="/" onNavigate={close}>
                All products
              </NavLink>
              <NavLink
                href="/?on_sale=true"
                onNavigate={close}
                className="text-destructive"
              >
                On sale
              </NavLink>
            </Section>
            <Section title="Categories">
              <React.Suspense fallback={<LinksSkeleton />}>
                <CategoryLinks onNavigate={close} />
              </React.Suspense>
            </Section>
            <Section title="Brands">
              <React.Suspense fallback={<LinksSkeleton />}>
                <BrandLinks onNavigate={close} />
              </React.Suspense>
            </Section>
            <Section title="Account">
              <NavLink href="/account" onNavigate={close}>
                My account
              </NavLink>
            </Section>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="px-2 text-xs font-medium text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function CategoryLinks({ onNavigate }: { onNavigate: () => void }) {
  return useCategories().map((category) => (
    <NavLink
      key={category.id}
      href={`/${category.slug}`}
      onNavigate={onNavigate}
    >
      {category.name}
    </NavLink>
  ))
}

function BrandLinks({ onNavigate }: { onNavigate: () => void }) {
  return useBrands().map((brand) => (
    <NavLink
      key={brand.id}
      href={brandHref(brand.slug)}
      onNavigate={onNavigate}
    >
      {brand.name}
    </NavLink>
  ))
}

function NavLink({
  href,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { href: string }) {
  const active = usePathname() === href
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-2 py-1.5 text-sm hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function LinksSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-2 py-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
