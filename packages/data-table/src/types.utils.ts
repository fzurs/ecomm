export type Simplify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Merge<A, B> = Simplify<Omit<A, keyof B> & B>
