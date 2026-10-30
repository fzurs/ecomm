"use client"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
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

/** The form's submit button, disabled with a spinner while its action runs. */
export function SubmitButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Spinner />}
      {children}
    </Button>
  )
}
