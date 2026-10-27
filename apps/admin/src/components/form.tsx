import { useFieldContext, useFormContext } from "@/hooks/form-context"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
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
  InputGroupAddon,
  InputGroupButton,
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
import { CircleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"

export function Form({
  onSubmit,
  children,
  ...props
}: React.ComponentProps<"form">) {
  const form = useFormContext()

  return (
    <form
      {...props}
      id={form.formId}
      onSubmit={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        onSubmit?.(e)
        const formElement = e.currentTarget
        try {
          await form.handleSubmit()
        } finally {
          scrollToFirstInvalidField(formElement)
        }
      }}
    >
      <FormError />
      {children}
    </form>
  )
}

/** The form-level error set by `applyServerErrors` (e.g. wrong credentials). */
function FormError() {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => state.errorMap.onSubmit}
      children={(error) => {
        // Schema errors also land here, as a map of field issues: those are
        // shown on each field, so only a `{ message }` error is rendered.
        const message =
          error && typeof error === "object" && "message" in error
            ? error.message
            : undefined
        if (typeof message !== "string") return null

        return (
          <Alert variant="destructive" data-slot="form-error" className="mb-6">
            <CircleAlertIcon />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )
      }}
    />
  )
}

function scrollToFirstInvalidField(formElement: HTMLFormElement) {
  // Wait for React to render the field errors before measuring.
  requestAnimationFrame(() => {
    formElement
      .querySelector(
        '[data-slot="form-error"], [data-slot="field"][data-invalid="true"]'
      )
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  })
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

export function PasswordField({
  label = "Password",
  ...props
}: Omit<
  React.ComponentProps<typeof InputGroupField>,
  "label" | "type" | "children"
> & {
  label?: string
}) {
  const [visible, setVisible] = React.useState(false)

  return (
    <InputGroupField
      autoComplete="current-password"
      type={visible ? "text" : "password"}
      label={label}
      {...props}
    >
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroupField>
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
  // Numbers too: the field keeps the option value as is (e.g. an ARCA code).
  options: {
    label: string
    value: string | number
    icon?: React.JSX.Element
  }[]
  placeholder?: string
}) {
  const field = useFieldContext()
  const fieldId = React.useId()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Select<string | number>
        name={field.name}
        items={options}
        value={field.state.value as string | number}
        onValueChange={field.handleChange}
      >
        <SelectTrigger
          id={fieldId}
          aria-invalid={isInvalid}
          className="w-full"
          {...props}
        >
          <SelectValue>
            {(value) => {
              // The icon is shown next to the selected label, as in the list.
              const option = options.find((opt) => opt.value === value)
              if (!option) return placeholder
              return (
                <>
                  {option.icon}
                  {option.label}
                </>
              )
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={String(opt.value)} value={opt.value}>
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
