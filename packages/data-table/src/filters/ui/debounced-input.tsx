"use client"

import { Input } from "@workspace/ui/components/input"
import { useMemo, useState } from "react"
import { debounce } from "../lib/debounce"

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 500, // This is the wait time, not the function
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounceMs?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue)
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue)

  // Sync with initialValue when it changes (adjusting state while rendering,
  // instead of in an effect that renders twice)
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue)
    setValue(initialValue)
  }

  const debouncedOnChange = useMemo(
    () =>
      debounce((newValue: string | number) => {
        onChange(newValue)
      }, debounceMs),
    [debounceMs, onChange]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue) // Update local state immediately
    debouncedOnChange(newValue) // Call debounced version
  }

  return <Input {...props} value={value} onChange={handleChange} />
}
