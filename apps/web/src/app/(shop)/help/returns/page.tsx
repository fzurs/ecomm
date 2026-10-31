import Link from "next/link"

export const metadata = { title: "Returns" }

export default function ReturnsPage() {
  return (
    <div className="typeset mx-auto w-full max-w-3xl">
      <h1>Returns</h1>
      <h2>Changed your mind</h2>
      <p>
        You can revoke any purchase within 10 calendar days of receiving it,
        without giving a reason (Ley 24.240, art. 34, and Res. 424/2020). Use
        the <Link href="/revocation">botón de arrepentimiento</Link> with your
        order number and email: you get a code for your request right away.
      </p>
      <p>
        If the order was already shipped, we tell you how to send it back; the
        return shipping is on us. The product has to come back as you got it.
        Once it&apos;s back, we give your payment back the way you paid and send
        you the credit note.
      </p>
      <h2>Faulty products</h2>
      <p>
        Every product has the legal warranty (Ley 24.240, art. 11) and, if any,
        its maker&apos;s. If something arrives broken or stops working,{" "}
        <Link href="/help/contact">write to us</Link> with your order number and
        a photo, and we&apos;ll replace or repair it.
      </p>
    </div>
  )
}
