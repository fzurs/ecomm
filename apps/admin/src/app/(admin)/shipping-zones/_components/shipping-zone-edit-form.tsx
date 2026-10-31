import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ShippingZone } from "@workspace/api-client"
import { shippingZonesUpdateMutation } from "@workspace/api-client/query"
import { useAppForm } from "@/hooks/form"
import { applyServerErrors } from "@/lib/utils"
import { invalidateShippingZones } from "../_lib/invalidate-shipping-zones"
import { toShippingZoneFormValues } from "../_lib/shipping-zone-schema"
import { shippingZoneFormOpts } from "./shipping-zone-fields"

export function useShippingZoneEditForm({
  zone,
  onSuccess,
}: {
  zone: ShippingZone
  onSuccess?: (zone: ShippingZone) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...shippingZonesUpdateMutation(),
    onSuccess: () => invalidateShippingZones(queryClient),
  })

  return useAppForm({
    ...shippingZoneFormOpts,
    formId: `update-shipping-zone-form-${zone.id}`,
    defaultValues: toShippingZoneFormValues(zone),
    onSubmit: async ({ value, formApi }) => {
      try {
        const updated = await mutateAsync({
          path: { id: zone.id },
          body: value,
        })
        onSuccess?.(updated)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}
