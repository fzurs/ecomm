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
