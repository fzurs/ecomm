/**
 * What a form's action (`useActionState`) answers: the errors to show, by
 * field (the input's name) or for the whole form, and the values to put back,
 * since React resets the form after the action.
 */
export type FormState = {
  fieldErrors?: Partial<Record<string, string>>
  formError?: string
  values?: Record<string, string>
}

/** A form value, as text. */
export function textOf(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}
