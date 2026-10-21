"use client"

import { createContext, useContext, useMemo, useState } from "react"

export type RowAction = "edit" | "delete" | "view"

type RowActionsContextType<T> = {
  action: RowAction | null
  row: T | null
  openAction: (action: RowAction, row: T) => void
  closeAction: () => void
  clearRow: () => void
}

const RowActionsContext = createContext<RowActionsContextType<unknown> | null>(
  null
)

export function useRowActions<T>() {
  const context = useContext(RowActionsContext)

  if (!context) {
    throw new Error("useRowActions must be used within RowActionsProvider")
  }

  return context as RowActionsContextType<T>
}

/**
 * Binds a Dialog/AlertDialog/Drawer to one row action. Spread `rootProps` on
 * the root; the row is kept until the close animation finishes so the content
 * doesn't disappear mid-transition.
 */
export function useRowActionDialog<T>(action: RowAction) {
  const { action: current, row, closeAction, clearRow } = useRowActions<T>()

  return {
    row,
    closeAction,
    rootProps: {
      open: current === action,
      onOpenChange: (open: boolean) => {
        if (!open) closeAction()
      },
      onOpenChangeComplete: (open: boolean) => {
        // Switching to another action (e.g. view -> edit) keeps the row.
        if (!open && current === null) clearRow()
      },
    },
  }
}

export function RowActionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [action, setAction] = useState<RowAction | null>(null)
  const [row, setRow] = useState<unknown>(null)

  const value = useMemo<RowActionsContextType<unknown>>(
    () => ({
      action,
      row,
      openAction: (action, row) => {
        setAction(action)
        setRow(row)
      },
      closeAction: () => setAction(null),
      clearRow: () => setRow(null),
    }),
    [action, row]
  )

  return <RowActionsContext value={value}>{children}</RowActionsContext>
}
