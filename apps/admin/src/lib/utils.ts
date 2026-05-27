export function snakeCaseToTitle(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K]
} & {}

export function nullsToUndefined<T extends Record<string, unknown>>(
  params: T
): NullToUndefined<T> {
  const result = {} as NullToUndefined<T>
  for (const key of Object.keys(params) as (keyof T)[]) {
    result[key] = (params[key] === null ? undefined : params[key]) as never
  }
  return result
}

export function toNullIfEmpty(value: unknown): unknown | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value) && value.length === 0) return null
  if (typeof value === "string" && value.trim() === "") return null
  return value
}
