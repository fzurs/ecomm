import { createContext, useContext, useMemo, useState } from "react"

type RowActionsOpenType = "edit" | "delete"

type RowActionsType<T> = {
  open: RowActionsOpenType | null
  setOpen: (value: RowActionsOpenType | null) => void
  currentRow: T | null
  setCurrentRow: (item: T | null) => void
}

const RowActionsContext = createContext<RowActionsType<unknown> | null>(null)

export function useRowActions<T>() {
  const context = useContext(RowActionsContext)

  if (!context) {
    throw new Error("useRowActions must be used within RowActionsProvider")
  }

  return context as RowActionsType<T>
}

export function RowActionsProvider<T>({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState<RowActionsOpenType | null>(null)
  const [currentRow, setCurrentRow] = useState<T | null>(null)

  const value = useMemo<RowActionsType<T>>(
    () => ({
      open,
      setOpen,
      currentRow,
      setCurrentRow,
    }),
    [currentRow, open]
  )

  return (
    <RowActionsContext value={value as RowActionsType<unknown>}>
      {children}
    </RowActionsContext>
  )
}
