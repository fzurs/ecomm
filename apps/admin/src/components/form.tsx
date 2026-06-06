import { useFieldContext } from "@/hooks/form-context"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import React from "react"

export function FormLabel({
  ...props
}: React.ComponentProps<typeof FieldLabel>) {
  const field = useFieldContext()

  return <FieldLabel htmlFor={field.name} {...props} />
}

export function FormTextInput(props: React.ComponentProps<typeof Input>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

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

export function FormField(props: React.ComponentProps<typeof Field>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return <Field data-invalid={isInvalid} {...props} />
}

export function FormMessage(props: React.ComponentProps<typeof FieldError>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return isInvalid && <FieldError errors={field.state.meta.errors} {...props} />
}
