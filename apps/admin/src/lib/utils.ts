import { AnyFieldApi, AnyFormApi } from "@tanstack/react-form"

export function getFormFieldId(form: AnyFormApi, field: AnyFieldApi) {
  return form.formId + "-" + field.name
}

export function capitalize(str: string) {
  return str.at(0)?.toUpperCase() + str.slice(1)
}
