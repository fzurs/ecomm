import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ShippingZone } from "@workspace/api-client"
import { shippingZonesCreateMutation } from "@workspace/api-client/query"
import { useAppForm } from "@/hooks/form"
import { applyServerErrors } from "@/lib/utils"
import { invalidateShippingZones } from "../_lib/invalidate-shipping-zones"
import { shippingZoneFormOpts } from "./shipping-zone-fields"

export function useShippingZoneCreateForm({
  onSuccess,
}: {
  onSuccess?: (zone: ShippingZone) => void
} = {}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...shippingZonesCreateMutation(),
    onSuccess: () => invalidateShippingZones(queryClient),
  })

  return useAppForm({
    ...shippingZoneFormOpts,
    formId: "create-shipping-zone-form",
    onSubmit: async ({ value, formApi }) => {
      try {
        const zone = await mutateAsync({ body: value })
        onSuccess?.(zone)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}
