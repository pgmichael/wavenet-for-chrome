import { useEffect } from 'react'

/**
 * What if `useEffect`, but without the last argument?
 */
export const useMount = (effect) => useEffect(effect, [])
