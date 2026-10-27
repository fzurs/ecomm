import { VoucherType } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { voucherTypes } from "../_lib/voucher-type"

export function VoucherTypeBadge({
  voucherType,
  ...props
}: { voucherType: VoucherType } & React.ComponentProps<typeof Badge>) {
  return (
    <Badge variant="secondary" {...props}>
      {voucherTypes[voucherType]}
    </Badge>
  )
}
