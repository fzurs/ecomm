import Link from "next/link"

export const metadata = { title: "Terms" }

// A starting point for the store's terms: to review before going live.
export default function TermsPage() {
  return (
    <div className="typeset mx-auto w-full max-w-3xl">
      <h1>Terms and conditions</h1>
      <h2>Prices and stock</h2>
      <p>
        Prices are in Argentine pesos and include VAT. A price or a stock that
        changes applies to the orders placed after the change: yours keeps the
        ones it was placed with. Shipping is added at checkout, by province (
        <Link href="/help/shipping">shipping</Link>).
      </p>
      <h2>Payment</h2>
      <p>
        Orders are paid with Mercado Pago. One not paid within 72 hours is
        cancelled, and its products go back on sale. Each paid order gets its
        electronic invoice by email.
      </p>
      <h2>Revoking a purchase</h2>
      <p>
        You can revoke it within 10 days of receiving it with the{" "}
        <Link href="/revocation">botón de arrepentimiento</Link>, without giving
        a reason. How returns and warranties work is in{" "}
        <Link href="/help/returns">returns</Link>.
      </p>
      <h2>Your account</h2>
      <p>
        You can buy without an account. If you make one, keep your password to
        yourself; what we do with your data is in the{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
      <h2>Disputes</h2>
      <p>
        These terms follow the law of Argentina, including the consumer
        protection law (Ley 24.240). You can also reach the consumer defense
        office of your jurisdiction.
      </p>
    </div>
  )
}
