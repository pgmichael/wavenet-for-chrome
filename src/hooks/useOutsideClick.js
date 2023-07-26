import { useRef } from 'react'
import { useMount } from './useMount'

/**
 * Trigger a callback when the user clicks outside the element the returned ref is attached to.
 */
export const useOutsideClick = (callback) => {
  const ref = useRef(null)

  const mousedownHandler = (event) => {
    if (ref.current && !ref.current.contains(event.composedPath()[0])) callback()
  }

  useMount(() => {
    document.addEventListener('mousedown', mousedownHandler)
    return () => document.removeEventListener('mousedown', mousedownHandler)
  })

  return ref
}
