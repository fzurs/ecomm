import { useFieldContext, useFormContext } from "@/hooks/form-context"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { InputGroupInput } from "@workspace/ui/components/input-group"
import { Select, SelectTrigger } from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import * as React from "react"

function FormRoot({ ...props }: React.ComponentProps<"form">) {
  const form = useFormContext()

  return (
    <form
      id={form.formId}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      {...props}
    />
  )
}

function FormField({ ...props }: React.ComponentProps<typeof Field>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return <Field data-invalid={isInvalid} {...props} />
}

function FormLabel({ ...props }: React.ComponentProps<typeof FieldLabel>) {
  const field = useFieldContext()

  return <FieldLabel htmlFor={field.name} {...props} />
}

function FormInput({ ...props }: React.ComponentProps<typeof Input>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Input
      id={field.name}
      name={field.name}
      value={(field.state.value as string) ?? ""}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      aria-invalid={isInvalid}
      {...props}
    />
  )
}

function FormNumberInput({ ...props }: React.ComponentProps<typeof FormInput>) {
  const field = useFieldContext()

  return (
    <FormInput
      type="number"
      onChange={(e) => {
        const value = e.target.value
        field.handleChange(value ? Number(e.target.value) : null)
      }}
      {...props}
    />
  )
}

function FormInputGroupInput({
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <InputGroupInput
      id={field.name}
      name={field.name}
      value={(field.state.value as string) ?? ""}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      aria-invalid={isInvalid}
      {...props}
    />
  )
}

function FormTextarea({ ...props }: React.ComponentProps<typeof Textarea>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Textarea
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

function FormSelect({ ...props }: React.ComponentProps<typeof Select>) {
  const field = useFieldContext()

  return (
    <Select
      value={field.state.value as string}
      onValueChange={field.handleChange}
      {...props}
    />
  )
}

function FormSelectTrigger({
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return <SelectTrigger id={field.name} aria-invalid={isInvalid} {...props} />
}

function FormCheckbox({ ...props }: React.ComponentProps<typeof Checkbox>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Checkbox
      id={field.name}
      aria-invalid={isInvalid}
      checked={field.state.value as never}
      onBlur={field.handleBlur}
      onCheckedChange={field.handleChange}
      {...props}
    />
  )
}

function FormMessage({ ...props }: React.ComponentProps<typeof FieldError>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  if (isInvalid) return null

  return <FieldError errors={field.state.meta.errors} {...props} />
}

function FormSubmit({ ...props }: React.ComponentProps<typeof Button>) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.isSubmitting, state.isPristine]}
      children={([isSubmitting, isPristine]) => (
        <Button
          form={form.formId}
          type="submit"
          disabled={isSubmitting || isPristine}
          {...props}
        />
      )}
    />
  )
}

export {
  FormRoot,
  FormField,
  FormLabel,
  FormInput,
  FormNumberInput,
  FormInputGroupInput,
  FormTextarea,
  FormSelect,
  FormSelectTrigger,
  FormCheckbox,
  FormMessage,
  FormSubmit,
}
