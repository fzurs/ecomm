import { useFieldContext, useFormContext } from "@/hooks/form-context"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  InputGroup,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import * as React from "react"

export function Form({ onSubmit, ...props }: React.ComponentProps<"form">) {
  const form = useFormContext()

  return (
    <form
      {...props}
      id={form.formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSubmit?.(e)
        void form.handleSubmit()
      }}
    />
  )
}

export function TextField({
  label,
  description,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string
  description?: string
}) {
  const field = useFieldContext()
  const fieldId = React.useId()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Input
        id={fieldId}
        name={field.name}
        value={(field.state.value as string) ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export function NumberField({
  ...props
}: React.ComponentProps<typeof TextField>) {
  const field = useFieldContext()

  return (
    <TextField
      type="number"
      inputMode="decimal"
      onChange={(e) => {
        const raw = e.target.value
        const next = raw === "" ? null : e.target.valueAsNumber
        field.handleChange(Number.isNaN(next) ? null : next)
      }}
      {...props}
    />
  )
}

export function EmailField({
  label = "Email",
  ...props
}: Omit<React.ComponentProps<typeof TextField>, "label" | "type"> & {
  label?: string
}) {
  return (
    <TextField
      inputMode="email"
      autoComplete="email"
      type="email"
      label={label}
      {...props}
    />
  )
}

export function TextareaField({
  label,
  description,
  ...props
}: React.ComponentProps<typeof Textarea> & {
  label: string
  description?: string
}) {
  const field = useFieldContext()
  const fieldId = React.useId()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Textarea
        id={fieldId}
        name={field.name}
        value={(field.state.value as string) ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export function InputGroupField({
  label,
  description,
  children,
  ...props
}: React.ComponentProps<typeof InputGroupInput> & {
  label: string
  description?: React.ReactNode
}) {
  const field = useFieldContext()
  const fieldId = React.useId()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={fieldId}
          name={field.name}
          value={(field.state.value as string) ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          {...props}
        />
        {children}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export function CheckboxField({
  label,
  ...props
}: React.ComponentProps<typeof Checkbox> & {
  label: string
}) {
  const field = useFieldContext()
  const fieldId = React.useId()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid} orientation="horizontal">
      <Checkbox
        id={fieldId}
        name={field.name}
        aria-invalid={isInvalid}
        checked={field.state.value as boolean}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
        {...props}
      />
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
    </Field>
  )
}

export function FileField({ ...props }: React.ComponentProps<typeof Input>) {
  const field = useFieldContext()
  const fieldId = React.useId()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <Input
        type="file"
        id={fieldId}
        name={field.name}
        // value={(field.state.value as string) ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.files?.item(0) ?? null)}
        aria-invalid={isInvalid}
        {...props}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export function SelectField({
  label,
  description,
  options,
  placeholder,
  ...props
}: React.ComponentProps<typeof SelectTrigger> & {
  label: string
  description?: string
  options: { label: string; value: string; icon?: React.JSX.Element }[]
  placeholder?: string
}) {
  const field = useFieldContext()
  const fieldId = React.useId()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Select
        name={field.name}
        items={options}
        value={field.state.value as string}
        onValueChange={field.handleChange}
      >
        <SelectTrigger
          id={fieldId}
          aria-invalid={isInvalid}
          className="w-full"
          {...props}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export function SubmitButton({
  ...props
}: React.ComponentProps<typeof Button>) {
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
