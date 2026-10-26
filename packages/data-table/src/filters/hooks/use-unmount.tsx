/*
 * Source: https://usehooks-ts.com/react-hook/use-unmount
 */

import { useEffect, useRef } from "react"

export function useUnmount(func: () => void) {
  const funcRef = useRef(func)

  useEffect(() => {
    funcRef.current = func
  })

  useEffect(
    () => () => {
      funcRef.current()
    },
    []
  )
}
