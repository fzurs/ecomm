import { schemas } from "@workspace/api-client"

export function isOutOfStock(
  status?: (typeof schemas.StatusEnum.options)[number] | null
) {
  return !!status && status === schemas.StatusEnum.Enum.out_of_stock
}
