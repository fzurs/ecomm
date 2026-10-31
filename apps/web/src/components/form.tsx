"use client"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import * as React from "react"
import { useFormStatus } from "react-dom"

/**
 * A labelled input with its error, for the forms whose actions answer a
 * `FormState`. `name` is also the input's id and the key of its error.
 */
export function TextField({
  label,
  name,
  error,
  description,
  labelAction,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string
  name: string
  error?: string
  description?: React.ReactNode
  /** Next to the label, e.g. a "Forgot your password?" link. */
  labelAction?: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error || undefined}>
      <div className="flex items-center">
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {labelAction && <div className="ml-auto">{labelAction}</div>}
      </div>
      <Input
        // The forms pass back what was sent as `defaultValue` (React resets them
        // after the action), and Base UI keeps the first one: a new one remounts.
        key={String(props.defaultValue ?? "")}
        id={name}
        name={name}
        aria-invalid={!!error || undefined}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

/** A labelled textarea with its error, like `TextField`. */
export function TextareaField({
  label,
  name,
  error,
  description,
  ...props
}: React.ComponentProps<typeof Textarea> & {
  label: string
  name: string
  error?: string
  description?: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
        key={String(props.defaultValue ?? "")}
        id={name}
        name={name}
        aria-invalid={!!error || undefined}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

/**
 * A labelled select with its error. Controlled (`value`, `onValueChange`):
 * React resets the form after the action, and a select keeps what was chosen.
 * Its `name` sends the value with the form.
 */
export function SelectField<T extends string | number>({
  label,
  name,
  items,
  value,
  onValueChange,
  error,
  description,
}: {
  label: string
  name: string
  items: { value: T; label: string }[]
  value: T
  onValueChange: (value: T) => void
  error?: string
  description?: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select<T>
        name={name}
        items={items}
        value={value}
        onValueChange={(next) => next !== null && onValueChange(next)}
      >
        <SelectTrigger
          id={name}
          aria-invalid={!!error || undefined}
          className="w-full"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={String(item.value)} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

/** The form's submit button, disabled with a spinner while its action runs. */
export function SubmitButton({
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending && <Spinner />}
      {children}
    </Button>
  )
}
