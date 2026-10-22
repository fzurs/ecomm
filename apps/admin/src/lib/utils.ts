import { AnyFieldApi, AnyFormApi } from "@tanstack/react-form"

export function getFormFieldId(form: AnyFormApi, field: AnyFieldApi) {
  return form.formId + "-" + field.name
}

/**
 * Shows a failed submit on the form. DRF validation errors go to their fields
 * (`{ field: ["message"] }`, nested for lists like `{ items: [{}, { quantity:
 * ["message"] }] }`); the rest (`non_field_errors`, `detail`, network or server
 * errors) become a form-level error, rendered by `FormError`.
 */
export function applyServerErrors(form: AnyFormApi, error: unknown) {
  const response = (
    error as { response?: { status?: number; data?: unknown } } | null
  )?.response
  const data = response?.data

  // Errors are objects; a string body is an HTML error page, not a message.
  const entries =
    data && typeof data === "object" ? flattenServerErrors(data) : []

  const formMessages: string[] = []
  for (const [name, message] of entries) {
    if (name in form.fieldInfo) {
      form.setFieldMeta(name, (prev) => ({
        ...prev,
        // Same shape as the schema errors, which FieldError reads `.message` from.
        errorMap: { ...prev.errorMap, onSubmit: { message } },
      }))
    } else {
      formMessages.push(message)
    }
  }

  if (entries.length === 0) {
    console.error(error)
    formMessages.push(
      response
        ? `Unexpected server error (${response.status}). Try again.`
        : "Could not reach the server. Check your connection and try again."
    )
  }

  if (formMessages.length > 0) {
    form.setErrorMap({ onSubmit: { message: formMessages.join(" ") } })
  }
}

function flattenServerErrors(data: unknown, path = ""): [string, string][] {
  if (typeof data === "string") return [[path, data]]
  if (Array.isArray(data)) {
    if (data.every((item) => typeof item === "string")) {
      const [message] = data
      return message ? [[path, message]] : []
    }
    return data.flatMap((item, i) => flattenServerErrors(item, `${path}[${i}]`))
  }
  if (data && typeof data === "object") {
    return Object.entries(data).flatMap(([key, value]) =>
      flattenServerErrors(value, path ? `${path}.${key}` : key)
    )
  }
  return []
}

export function capitalize(str: string) {
  return str.at(0)?.toUpperCase() + str.slice(1)
}

export function formatPrice(price: number | string) {
  const value = Number(price).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `$ ${value}`
}
