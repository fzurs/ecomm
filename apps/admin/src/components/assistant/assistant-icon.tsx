import { BotMessageSquareIcon, type LucideProps } from "lucide-react"
import { useId } from "react"

/**
 * The assistant's icon, drawn with its gradient. An SVG stroke can't take a
 * CSS gradient, so the icon carries its own <linearGradient> (an id per
 * instance) and references it. userSpaceOnUse spans lucide's 24x24 viewBox;
 * the default units break on straight lines, whose bounding box has no height.
 */
export function AssistantIcon(props: LucideProps) {
  const id = useId()
  return (
    // With children, lucide stops setting aria-hidden on its own.
    <BotMessageSquareIcon aria-hidden stroke={`url(#${id})`} {...props}>
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="24"
          y2="0"
        >
          <stop offset="0%" className="[stop-color:var(--color-violet-500)]" />
          {/* SVG blends in sRGB: straight from violet to amber the middle
              turns grayish, so it goes through pink. */}
          <stop offset="50%" className="[stop-color:var(--color-pink-500)]" />
          <stop offset="100%" className="[stop-color:var(--color-amber-400)]" />
        </linearGradient>
      </defs>
    </BotMessageSquareIcon>
  )
}
