import { InvoiceDetail } from "@workspace/api-client"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { CircleAlertIcon, InfoIcon, UnplugIcon } from "lucide-react"

/** What ARCA (or the emission) said: why it failed, and its observations. */
export function ArcaMessages({ invoice }: { invoice: InvoiceDetail }) {
  const failed =
    invoice.status === "rejected" || invoice.status === "unverified"

  return (
    <>
      {failed && (
        <Alert variant="destructive">
          {invoice.status === "unverified" ? (
            <UnplugIcon />
          ) : (
            <CircleAlertIcon />
          )}
          <AlertTitle>
            {invoice.status === "unverified"
              ? "ARCA's answer was lost"
              : "Rejected"}
          </AlertTitle>
          <AlertDescription>
            {invoice.status === "unverified" && (
              <p>
                It may have been authorized: verify it with ARCA before anything
                else. Emitting it again could duplicate it.
              </p>
            )}
            {invoice.arca_errors.length > 0 ? (
              <ul className="list-disc pl-4">
                {invoice.arca_errors.map((error) => (
                  <li key={error.code}>
                    {error.code}: {error.msg}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{invoice.error_message}</p>
            )}
          </AlertDescription>
        </Alert>
      )}
      {invoice.observations.length > 0 && (
        <Alert>
          <InfoIcon />
          <AlertTitle>ARCA observations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {invoice.observations.map((observation) => (
                <li key={observation.code}>
                  {observation.code}: {observation.msg}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
