import { CONTACT } from "@/lib/store-info"

export const metadata = { title: "Contact" }

export default function ContactPage() {
  const rows = [
    { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    {
      label: "Phone",
      value: CONTACT.phone,
      href: `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`,
    },
    { label: "Address", value: CONTACT.address },
    { label: "Hours", value: CONTACT.hours },
  ].filter((row) => row.value)

  return (
    <div className="typeset mx-auto w-full max-w-3xl">
      <h1>Contact</h1>
      <p>
        Questions about a product, your order or an invoice? Write to us and
        include your order number if you have one.
      </p>
      {rows.length ? (
        <dl>
          {rows.map(({ label, value, href }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{href ? <a href={href}>{value}</a> : value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>Our contact details will be here soon.</p>
      )}
    </div>
  )
}
