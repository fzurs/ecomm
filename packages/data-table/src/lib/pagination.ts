export type PageItem = number | "ellipsis-start" | "ellipsis-end"

/**
 * Page indexes to show as buttons: always the first and last pages, plus
 * `siblings` pages on each side of the current one, with ellipses in the gaps.
 * The list keeps the same length while moving, so the buttons don't jump.
 */
export function getPageItems(
  pageIndex: number,
  pageCount: number,
  siblings = 1
): PageItem[] {
  // first + last + current + siblings on each side + two ellipses
  const slots = 5 + siblings * 2
  if (pageCount <= slots) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }

  const last = pageCount - 1
  const start = Math.max(pageIndex - siblings, 1)
  const end = Math.min(pageIndex + siblings, last - 1)
  const showStartEllipsis = start > 2
  const showEndEllipsis = end < last - 2
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i)

  if (!showStartEllipsis) {
    return [...range(0, slots - 3), "ellipsis-end", last]
  }
  if (!showEndEllipsis) {
    return [0, "ellipsis-start", ...range(pageCount - (slots - 2), last)]
  }
  return [0, "ellipsis-start", ...range(start, end), "ellipsis-end", last]
}
