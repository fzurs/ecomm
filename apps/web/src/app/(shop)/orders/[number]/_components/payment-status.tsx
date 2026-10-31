import type { MyOrder } from "@workspace/api-client"
import { cn } from "cn"
import {
  BanIcon,
  CircleCheckIcon,
  ClockIcon,
  DownloadIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { paymentInProgress, rejectionReason } from "@/lib/payment-status"
import { PayButton } from "./pay-button"
import { RefreshWhileWaiting } from "./refresh-while-waiting"

/**
 * Where the order's payment stands, and what the customer can do: pay it, wait
 * for Mercado Pago, try again, or download the invoice. `returned` is the
 * status Mercado Pago comes back with (its back URL), before its webhook
 * reaches the API.
 */
export function PaymentStatus({
  order,
  returned,
}: {
  order: MyOrder
  returned: string | null
}) {
  const payment = order.payment_status

  if (order.status === "cancelled") {
    return (
      <Notice icon={<BanIcon />} tone="muted">
        This order was cancelled: it wasn&apos;t paid in time.
      </Notice>
    )
  }

  if (order.status && order.status !== "pending") {
    return (
      <Notice icon={<CircleCheckIcon className="text-primary" />}>
        <p>
          We received your payment. Thank you! We&apos;ll write to{" "}
          <strong>{order.customer.email}</strong> when your order ships.
        </p>
        {order.has_invoice && (
          <a
            href={`/api/my/orders/${order.number}/invoice/`}
            className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
          >
            <DownloadIcon className="size-4" />
            Download invoice
          </a>
        )}
      </Notice>
    )
  }

  // Back from Mercado Pago, or a payment started: Mercado Pago confirms it on
  // its own, shortly (or when cash is paid at the counter).
  const waiting =
    (payment && paymentInProgress.includes(payment)) ||
    (payment === "created" &&
      ["approved", "pending", "in_process"].includes(returned ?? ""))
  if (waiting) {
    return (
      <Notice icon={<ClockIcon />}>
        <RefreshWhileWaiting />
        <p>
          We&apos;re waiting for Mercado Pago to confirm your payment. If you
          chose to pay in cash, pay it at the counter: we&apos;ll email{" "}
          <strong>{order.customer.email}</strong> as soon as it&apos;s in.
        </p>
      </Notice>
    )
  }

  if (payment === "rejected" || payment === "cancelled") {
    return (
      <Notice icon={<TriangleAlertIcon className="text-destructive" />}>
        <p>
          {payment === "rejected"
            ? rejectionReason(order.payment_status_detail)
            : "The payment was cancelled."}{" "}
          You can try again, with another card or method.
        </p>
        <PayButton number={order.number}>Try again</PayButton>
      </Notice>
    )
  }

  return (
    <Notice icon={<CircleCheckIcon className="text-primary" />}>
      <p>
        We received your order and sent the details to{" "}
        <strong>{order.customer.email}</strong>. It&apos;s waiting for its
        payment.
      </p>
      <PayButton number={order.number} />
    </Notice>
  )
}

function Notice({
  icon,
  tone,
  children,
}: {
  icon: React.ReactNode
  tone?: "muted"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl bg-muted p-4 text-sm [&>svg]:size-5 [&>svg]:shrink-0",
        tone === "muted" && "text-muted-foreground"
      )}
    >
      {icon}
      <div className="flex flex-col items-start gap-3">{children}</div>
    </div>
  )
}
