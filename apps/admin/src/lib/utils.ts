import { AnyFieldApi, AnyFormApi } from "@tanstack/react-form"

export function getFormFieldId(form: AnyFormApi, field: AnyFieldApi) {
  return form.formId + "-" + field.name
}

/**
 * Shows DRF validation errors (`{ field: ["message"] }`, nested for lists like
 * `{ items: [{}, { quantity: ["message"] }] }`) on the form fields.
 * Rethrows anything it can't place on a field, so it isn't swallowed.
 */
export function applyServerErrors(form: AnyFormApi, error: unknown) {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data

  const entries = flattenServerErrors(data).filter(
    ([name]) => name in form.fieldInfo
  )
  if (entries.length === 0) throw error

  for (const [name, message] of entries) {
    form.setFieldMeta(name, (prev) => ({
      ...prev,
      // Same shape as the schema errors, which FieldError reads `.message` from.
      errorMap: { ...prev.errorMap, onSubmit: { message } },
    }))
  }
}

function flattenServerErrors(data: unknown, path = ""): [string, string][] {
  if (typeof data === "string") return path ? [[path, data]] : []
  if (Array.isArray(data)) {
    if (data.every((item) => typeof item === "string")) {
      const [message] = data
      return path && message ? [[path, message]] : []
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
