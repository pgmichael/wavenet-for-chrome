import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { GitHub } from 'react-feather'
import { useState } from 'react'
import { Dialog } from '../components/Dialog'
import { OnboardingDialog } from './components/dialogs/OnboardingDialog'
import { Button } from '../components/Button'
import { useMount } from '../hooks/useMount'
import { useSync } from '../hooks/useSync'
import {
  TError,
  createGithubIssueFromError,
  isError,
} from './helpers/error-helpers'

// Event listeners -------------------------------------------------------------
window.addEventListener('load', function () {
  console.log('load')

  const root = document.createElement('div')
  const shadowRoot = root.attachShadow({ mode: 'open' })

  // Fetch the CSS file and replace rem values with px values, this is needed
  // so tailwind styles don't inherit the font size from the page.
  fetch(chrome.runtime.getURL('public/styles.css'))
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.text()
    })
    .then((text) => {
      const parsedText = text.replace(/(\d*\.?\d+)rem/g, (match, group) => {
        const pxValue = parseFloat(group) * 16
        return `${pxValue}px`
      })

      const styleEl = document.createElement('style')
      styleEl.textContent = parsedText
      shadowRoot.appendChild(styleEl)

      document.body.appendChild(root)
      createRoot(shadowRoot).render(<ContentScript />)
    })
    .catch((error) => {
      console.error('Failed to load CSS: ', error)
    })
})

// React component -------------------------------------------------------------
function ContentScript() {
  const { sync, ready } = useSync()
  const [error, setError] = useState<null | TError>(null)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const handlers = { setError }

  async function handleMessages(request, sender, sendResponse) {
    console.log('Handling message...', request, sender, sendResponse)

    if (!request) {
      return
    }

    if (isError(request)) {
      setError(request)

      return
    }

    // Add this to the handleMessages function
    if (request.id === 'downloadStatus') {
      // Show a notification to the user about download progress
      // You could update this to use a more sophisticated notification system
      if (request.payload.status === 'processing') {
        setProgressMessage(request.payload.message);
      } else if (request.payload.status === 'complete') {
        setProgressMessage(request.payload.message);
        setTimeout(() => setProgressMessage(null), 3000);
      }
    }
  }

  useMount(function () {
    chrome.runtime.onMessage.addListener(handleMessages)

    return () => chrome.runtime.onMessage.removeListener(handleMessages)
  })

  if (!error || !ready) {
    return null
  }

  if (
    error.errorCode === 'MISSING_API_KEY' ||
    (sync.user && !sync.user.credits)
  ) {
    return <OnboardingDialog onClose={() => setError(null)} />
  }

  return (
    <Dialog
      title={error.errorTitle}
      content={error.errorMessage}
      onClose={() => setError(null)}
      buttons={[
        <Button className="max-w-fit" onClick={() => setError(null)}>
          Close
        </Button>,
        <Button
          className="max-w-fit"
          type="primary"
          Icon={GitHub}
          onClick={() => createGithubIssueFromError(error)}
        >
          Create an issue
        </Button>,
      ]}
    />
  )
}
