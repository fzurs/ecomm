import { useFieldContext } from "@/hooks/form-context"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@workspace/ui/components/field"
import {
  InputGroupInput,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import { EyeOffIcon, EyeIcon } from "lucide-react"
import React from "react"

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "id" | "name" | "value" | "defaultValue" | "type"
> & {
  label: string
  description?: string
}

export function PasswordField({
  label,
  description,
  onBlur,
  onChange,
  ...props
}: PasswordFieldProps) {
  const field = useFieldContext<string>()
  const fieldId = React.useId()
  const descriptionId = `${fieldId}-description`
  const errorId = `${fieldId}-error`
  const [visible, setVisible] = React.useState(false)

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          autoComplete="current-password"
          {...props}
          id={fieldId}
          name={field.name}
          type={visible ? "text" : "password"}
          value={field.state.value ?? ""}
          onBlur={(e) => {
            field.handleBlur()
            onBlur?.(e)
          }}
          onChange={(e) => {
            field.handleChange(e.target.value)
            onChange?.(e)
          }}
          aria-invalid={isInvalid}
          aria-describedby={
            isInvalid ? errorId : description ? descriptionId : undefined
          }
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {isInvalid && (
        <FieldError id={errorId} errors={field.state.meta.errors} />
      )}
    </Field>
  )
}
