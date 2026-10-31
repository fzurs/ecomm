import Link from "next/link"
import { CONTACT } from "@/lib/store-info"

export const metadata = { title: "Privacy" }

// A starting point for the store's privacy policy (Ley 25.326): to review
// before going live, and to update with every new use of the customers' data
// (e.g. the admin's assistant, off in production: docs/production.md).
export default function PrivacyPage() {
  return (
    <div className="typeset mx-auto w-full max-w-3xl">
      <h1>Privacy policy</h1>
      <p>
        This policy says what personal data Acme Store keeps, what for and how
        you can see, fix or delete it, as Ley 25.326 on personal data protection
        asks.
      </p>
      <h2>What we keep</h2>
      <ul>
        <li>
          Your account: name, email and password (stored encrypted), or your
          Google account if you sign in with it.
        </li>
        <li>
          Your orders: what you bought, the shipping address and your phone.
        </li>
        <li>
          Your billing data: document or CUIT, VAT condition and legal name,
          which go on the invoices we send ARCA.
        </li>
      </ul>
      <p>
        We don&apos;t keep your card details: you pay in Mercado Pago, which has
        its own policy.
      </p>
      <h2>What for</h2>
      <p>
        To sell you and ship your orders, to invoice them as the tax law asks,
        and to write to you about them. We don&apos;t sell your data or use it
        for advertising.
      </p>
      <h2>Who else gets it</h2>
      <ul>
        <li>ARCA (ex AFIP), with each invoice.</li>
        <li>Mercado Pago, to charge your payment.</li>
        <li>The carrier, your name, address and phone, to deliver it.</li>
      </ul>
      <h2>How long</h2>
      <p>
        Invoices and their data are kept for the 10 years the tax law asks. The
        rest, while you have an account or as long as an order needs it.
      </p>
      <h2>Your rights</h2>
      <p>
        You can ask to see, fix or delete your data, for free, by{" "}
        {CONTACT.email ? (
          <a href={`mailto:${CONTACT.email}`}>writing to us</a>
        ) : (
          <Link href="/help/contact">writing to us</Link>
        )}
        ; we answer within 10 days (access) or 5 business days (fixing or
        deleting). The Agencia de Acceso a la Información Pública, the authority
        that enforces Ley 25.326, takes complaints from those whose rights
        weren&apos;t respected.
      </p>
    </div>
  )
}
