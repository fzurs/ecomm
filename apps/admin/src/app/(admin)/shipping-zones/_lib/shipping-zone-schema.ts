import { ShippingZone } from "@workspace/api-client"
import { zShippingZoneWritable } from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top. That a province is in one zone only, the API checks.
export const shippingZoneFormSchema = zShippingZoneWritable
  .pick({ name: true, provinces: true, cost: true, free_from: true })
  .extend({
    name: z.string().trim().min(1, "Name is required").max(100),
    provinces: zShippingZoneWritable.shape.provinces.min(
      1,
      "Choose at least one province"
    ),
  })

export type ShippingZoneFormValues = z.infer<typeof shippingZoneFormSchema>

export const emptyShippingZone: ShippingZoneFormValues = {
  name: "",
  provinces: [],
  cost: 0,
  free_from: null,
}

export function toShippingZoneFormValues(
  zone: ShippingZone
): ShippingZoneFormValues {
  return {
    name: zone.name,
    provinces: zone.provinces,
    cost: zone.cost,
    free_from: zone.free_from ?? null,
  }
}
