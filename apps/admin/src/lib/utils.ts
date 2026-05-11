export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return ""

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date))
  } catch {
    return ""
  }
}

// soy un vago que no me gusta declarar labels para el status enum
export function snakeCaseToTitle(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K]
}

export function nullsToUndefined<T extends Record<string, any>>(
  params: T
): NullToUndefined<T> {
  const result = {} as NullToUndefined<T>
  for (const key of Object.keys(params) as (keyof T)[]) {
    result[key] = (params[key] === null ? undefined : params[key]) as any
  }
  return result
}
