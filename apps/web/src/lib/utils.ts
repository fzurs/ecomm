import { StatusEnum } from "@workspace/api-client"

export const isOutOfStock = (status?: StatusEnum | null) =>
  !!status && status === "out_of_stock"
