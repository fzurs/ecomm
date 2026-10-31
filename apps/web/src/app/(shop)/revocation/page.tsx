import { Skeleton } from "@workspace/ui/components/skeleton"
import { Suspense } from "react"
import { RevocationForm } from "./_components/revocation-form"

export const metadata = { title: "Botón de arrepentimiento" }

/** Res. 424/2020: revoking a purchase online, as easily as it was made. */
export default function RevocationPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="typeset">
        <h1>Botón de arrepentimiento</h1>
        <p>
          You can revoke a purchase within 10 days of receiving it, or of buying
          it if that&apos;s later, without giving a reason. Ask here and
          you&apos;ll get a code for your request right away; once we approve
          it, we give your payment back.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <RevocationForm />
      </Suspense>
    </div>
  )
}
