import React, { useEffect, useState } from 'react'

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() =>
    getLocalStorageValue(key, defaultValue),
  )

  useEffect(
    () => localStorage.setItem(key, JSON.stringify(value)),
    [key, value],
  )

  return [value, setValue]
}

function getLocalStorageValue(key, defaultValue) {
  const saved = localStorage.getItem(key)
  const initial = JSON.parse(saved)

  return initial || defaultValue
}
