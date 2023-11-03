import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function ScrollToHash() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash

    const removeHashCharacter = (str) => {
      return str.slice(1)
    }

    if (hash) {
      const element = document.getElementById(removeHashCharacter(hash))

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          inline: 'nearest',
        })

        // Remove the hash from the URL
        navigate(location.pathname)
      }
    }
  }, [location.hash])

  return null
}
