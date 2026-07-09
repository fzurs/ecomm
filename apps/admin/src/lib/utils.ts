import { Option } from "@/types/data-table"
import { AnyFieldApi, AnyFormApi } from "@tanstack/react-form"
import Cookies from "js-cookie"

export function snakeCaseToTitle(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K]
} & {}

export function nullsToUndefined<T extends Record<string, unknown>>(
  obj: T
): NullToUndefined<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value ?? undefined])
  ) as NullToUndefined<T>
}

export function getFieldId(form: AnyFormApi, field: AnyFieldApi) {
  return form.formId + "-" + field.name
}

export const itemListToOptions = (data: { name: string; slug?: string }[]) =>
  data.map((item) => ({ label: item.name, value: item.slug }))

export function getCSRFToken() {
  return Cookies.get("csrftoken")
}

export const CSRFTOKEN_KEY = "X-CSRFToken"
