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
  const { response, entries } = parseServerError(error)

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
    formMessages.push(unexpectedErrorMessage(response))
  }

  if (formMessages.length > 0) {
    form.setErrorMap({ onSubmit: { message: formMessages.join(" ") } })
  }
}

/**
 * Message for a failed request outside a form (e.g. a toast): the DRF
 * messages joined, or a generic one for network and server errors.
 */
export function getServerErrorMessage(error: unknown) {
  const { response, entries } = parseServerError(error)
  if (entries.length > 0) {
    return entries.map(([, message]) => message).join(" ")
  }
  console.error(error)
  return unexpectedErrorMessage(response)
}

type ServerErrorResponse = { status?: number; data?: unknown }

function parseServerError(error: unknown) {
  const response = (error as { response?: ServerErrorResponse } | null)
    ?.response
  const data = response?.data

  // Errors are objects; a string body is an HTML error page, not a message.
  const entries =
    data && typeof data === "object" ? flattenServerErrors(data) : []

  return { response, entries }
}

function unexpectedErrorMessage(response: ServerErrorResponse | undefined) {
  return response
    ? `Unexpected server error (${response.status}). Try again.`
    : "Could not reach the server. Check your connection and try again."
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

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  trailingZeroDisplay: "stripIfInteger",
})

export function formatPrice(price: number | string | null | undefined) {
  if (price == null || price === "") return null
  const value = Number(price)
  return Number.isFinite(value) ? priceFormatter.format(value) : null
}
