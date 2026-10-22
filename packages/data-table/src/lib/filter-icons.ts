import {
  ArrowLeftRightIcon,
  CalendarIcon,
  CalendarRangeIcon,
  CircleDotIcon,
  HashIcon,
  ListChecksIcon,
  type LucideIcon,
  ToggleLeftIcon,
  TypeIcon,
} from "lucide-react"
import { FilterVariant } from "../types/data-table"

/**
 * One icon per filter variant, shared by the filter menu and the filter
 * controls so a column looks the same in both.
 */
export const filterVariantIcons: Record<FilterVariant, LucideIcon> = {
  text: TypeIcon,
  number: HashIcon,
  range: ArrowLeftRightIcon,
  boolean: ToggleLeftIcon,
  select: CircleDotIcon,
  "multi-select": ListChecksIcon,
  date: CalendarIcon,
  "date-range": CalendarRangeIcon,
}
