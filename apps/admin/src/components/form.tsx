import { useFieldContext } from "@/hooks/form-context"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import React from "react"

function useField() {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return { isInvalid, field }
}

export function FormLabel({
  ...props
}: React.ComponentProps<typeof FieldLabel>) {
  const field = useFieldContext()

  return <FieldLabel htmlFor={field.name} {...props} />
}

export function FormInput({ ...props }: React.ComponentProps<typeof Input>) {
  const { field, isInvalid } = useField()

  return (
    <Input
      id={field.name}
      name={field.name}
      value={field.state.value as string}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      aria-invalid={isInvalid}
      {...props}
    />
  )
}

export function FormField({ ...props }: React.ComponentProps<typeof Field>) {
  const { isInvalid } = useField()

  return <Field data-invalid={isInvalid} {...props} />
}

export function FormMessage({
  ...props
}: React.ComponentProps<typeof FieldError>) {
  const { isInvalid, field } = useField()

  return isInvalid && <FieldError errors={field.state.meta.errors} {...props} />
}
