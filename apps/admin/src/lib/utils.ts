import { AnyFieldApi, AnyFormApi } from "@tanstack/react-form"

export function getFormFieldId(form: AnyFormApi, field: AnyFieldApi) {
  return form.formId + "-" + field.name
}

/**
 * Shows DRF validation errors (`{ field: ["message"] }`) on the form fields.
 * Rethrows anything it can't place on a field, so it isn't swallowed.
 */
export function applyServerErrors(form: AnyFormApi, error: unknown) {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data
  if (!data || typeof data !== "object") throw error

  const entries = Object.entries(data).filter(
    ([name]) => name in form.fieldInfo
  )
  if (entries.length === 0) throw error

  for (const [name, messages] of entries) {
    const message = Array.isArray(messages) ? messages[0] : String(messages)
    form.setFieldMeta(name, (prev) => ({
      ...prev,
      errorMap: { ...prev.errorMap, onSubmit: message },
    }))
  }
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
