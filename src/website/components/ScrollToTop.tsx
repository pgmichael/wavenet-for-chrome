import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()
  const scrollToTop = () => {
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }

  useEffect(scrollToTop, [pathname])
  return null
}
