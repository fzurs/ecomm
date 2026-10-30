import { MailCheckIcon } from "lucide-react"

/** After a form that sends a link: where it went, and what to do with it. */
export function CheckYourEmail({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <MailCheckIcon className="size-5" />
      </div>
      <p className="font-medium">Check your email: {email}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}
