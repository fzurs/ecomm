"use client"

import { createContext, useContext, useMemo, useState } from "react"

export type RowAction = "edit" | "delete" | "view" | "invoice"

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
        // clearRow keeps the row if another action (e.g. view -> edit) is open.
        if (!open) clearRow()
      },
    },
  }
}

export function RowActionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, setState] = useState<{
    action: RowAction | null
    row: unknown
  }>({ action: null, row: null })

  const value = useMemo<RowActionsContextType<unknown>>(
    () => ({
      ...state,
      openAction: (action, row) => setState({ action, row }),
      closeAction: () => setState((prev) => ({ ...prev, action: null })),
      // Decide on the latest state: a stale callback must not clear a row
      // that another action opened in the meantime.
      clearRow: () =>
        setState((prev) =>
          prev.action === null ? { ...prev, row: null } : prev
        ),
    }),
    [state]
  )

  return <RowActionsContext value={value}>{children}</RowActionsContext>
}
