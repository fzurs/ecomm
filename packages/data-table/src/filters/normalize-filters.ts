export type NormalizeFilters<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K]
} & {}

export function normalizeFilters<T extends Record<string, unknown>>(
  obj: T
): NormalizeFilters<T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value ?? undefined])
  ) as NormalizeFilters<T>
}
