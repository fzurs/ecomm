import { Button } from "@workspace/ui/components/button"
import { cn } from "cn"
import { FilterXIcon } from "lucide-react"
import { memo } from "react"
import type { DataTableFilterActions } from "../core/types"
import { type Locale, t } from "../lib/i18n"

interface FilterActionsProps {
  hasFilters: boolean
  actions?: DataTableFilterActions
  locale?: Locale
}

export const FilterActions = memo(__FilterActions)
function __FilterActions({
  hasFilters,
  actions,
  locale = "en",
}: FilterActionsProps) {
  return (
    <Button
      className={cn(!hasFilters && "hidden")}
      variant="destructive"
      size="sm"
      onClick={actions?.removeAllFilters}
    >
      <FilterXIcon />
      <span className="hidden md:block">{t("clear", locale)}</span>
    </Button>
  )
}
