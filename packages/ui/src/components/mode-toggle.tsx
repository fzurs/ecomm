"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

const modes = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
] as const

// true only on the client: the theme is unknown while rendering on the server.
const subscribe = () => () => {}
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

/** Theme picker as icon tabs: system, light and dark. */
export function ModeToggle({
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, "value" | "onValueChange">) {
  // `theme` is the user's choice (system included), not the resolved one.
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()

  return (
    <Tabs
      {...props}
      // null leaves every tab inactive until the theme is known on the client.
      value={isClient ? (theme ?? null) : null}
      onValueChange={(value) => setTheme(value)}
    >
      {/* Compact: the list height is set through the tabs orientation
          variant, so it's overridden with the same variant. */}
      <TabsList
        aria-label="Theme"
        className="p-0.5 group-data-horizontal/tabs:h-7"
      >
        {modes.map((mode) => (
          <TabsTrigger
            key={mode.value}
            value={mode.value}
            aria-label={mode.label}
            title={mode.label}
            className="px-1.5 py-0.5"
          >
            <mode.icon className="size-3.5" />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
