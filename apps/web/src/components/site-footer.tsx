import { cacheLife } from "next/cache"
import Link from "next/link"
import { getAllCategories } from "@/lib/cache"
import { Logo } from "./logo"

// TODO: the store's real pages. Until then they lead nowhere.
const helpLinks = [
  { title: "Shipping", href: "#" },
  { title: "Returns", href: "#" },
  { title: "Contact", href: "#" },
]

// Argentina asks online stores for both: the "Botón de arrepentimiento" (to
// revoke a purchase within 10 days, Res. 424/2020) and ARCA's "Data fiscal" QR.
// TODO: the revocation form and the store's own QR.
const legalLinks = [
  { title: "Botón de arrepentimiento", href: "#" },
  { title: "Data fiscal", href: "#" },
]

/** The shop's footer: the catalog, help, the account and the legal links. */
export async function SiteFooter() {
  "use cache"
  cacheLife("days")
  const categories = await getAllCategories()

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Electronics, tools and parts for makers.
          </p>
        </div>
        <FooterColumn
          title="Shop"
          links={[
            ...categories.map(({ name, slug }) => ({
              title: name,
              href: `/${slug}`,
            })),
            { title: "All brands", href: "/brands" },
          ]}
        />
        <FooterColumn title="Help" links={helpLinks} />
        <FooterColumn
          title="Account"
          links={[
            { title: "My account", href: "/account" },
            { title: "Create an account", href: "/signup" },
          ]}
        />
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>© {new Date().getFullYear()} Acme Store</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {legalLinks.map((link) => (
              <li key={link.title}>
                <Link
                  href={link.href}
                  className="underline-offset-4 hover:underline"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { title: string; href: string }[]
}) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.title}>
            <Link href={link.href} className="hover:text-foreground">
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
