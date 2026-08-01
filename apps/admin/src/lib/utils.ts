import { AnyFieldApi, AnyFormApi } from "@tanstack/react-form"

export function getFieldId(form: AnyFormApi, field: AnyFieldApi) {
  return form.formId + "-" + field.name
}
