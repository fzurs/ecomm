import { formOptions } from "@tanstack/react-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { withForm } from "@/hooks/form"
import { getFormFieldId } from "@/lib/utils"
import {
  emptyShippingZone,
  shippingZoneFormSchema,
} from "../_lib/shipping-zone-schema"
import { ProvinceMultiSelect } from "./province-multi-select"

export const shippingZoneFormOpts = formOptions({
  defaultValues: emptyShippingZone,
  validators: { onSubmit: shippingZoneFormSchema },
})

/** The fields of a zone, the same to create and to edit it. */
export const ShippingZoneFields = withForm({
  ...shippingZoneFormOpts,
  render: function Render({ form }) {
    const getFieldId = getFormFieldId.bind(null, form)

    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField label="Name" placeholder="AMBA" />
              )}
            />
            <form.AppField
              name="provinces"
              children={(field) => {
                const fieldId = getFieldId(field)
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={fieldId}>Provinces</FieldLabel>
                    <ProvinceMultiSelect
                      id={fieldId}
                      aria-invalid={isInvalid}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    />
                    <FieldDescription>
                      Where it ships at this cost. A province is in one zone
                      only; the store doesn&apos;t ship to the ones in none.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <form.AppField
                name="cost"
                children={(field) => (
                  <field.NumberField
                    label="Cost"
                    description="IVA included, as charged."
                    min={0}
                    step={1}
                  />
                )}
              />
              <form.AppField
                name="free_from"
                children={(field) => (
                  <field.NumberField
                    label="Free from"
                    description="Free shipping from this subtotal. Empty: never."
                    min={0}
                    step={1}
                  />
                )}
              />
            </div>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
