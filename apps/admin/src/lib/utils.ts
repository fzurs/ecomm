import { AnyFieldApi, AnyFormApi } from "@tanstack/react-form"

export function getFormFieldId(form: AnyFormApi, field: AnyFieldApi) {
  return form.formId + "-" + field.name
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
