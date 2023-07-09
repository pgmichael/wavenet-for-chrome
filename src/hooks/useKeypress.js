import { useEffect, useState } from 'react'
import { useMount } from './useMount'

/**
 * Triggers a callback when a given key is pressed.
 */
export const useKeypress = (keyCode, callback) => {
  const [lastEvent, setLastEvent] = useState()
  useEffect(() => lastEvent && callback(lastEvent), [lastEvent])

  const keypressHandler = (event) =>
    event.code === keyCode && setLastEvent(event)

  useMount(() => {
    document.addEventListener('keypress', keypressHandler)
    return () => document.removeEventListener('keypress', keypressHandler)
  })
}
