import React, { useEffect, useState } from 'react'
import { useSync } from '../hooks/useSync'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMount } from '../hooks/useMount'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Billing } from './components/views/Billing'
import { Usage } from './components/views/Usage'
import { Preferences } from './components/views/Preferences'
import { Sandbox } from './components/views/Sandbox'
import { Dialog } from '../components/Dialog'
import { Button } from '../components/Button'
import { GitHub } from 'react-feather'
import { TError } from './helpers/error-helpers'
import { createStore, useStore } from '../hooks/useStore'

export const errorStore = createStore<null | TError>(null)

export function Extension() {
  const navigate = useNavigate()
  const { ready } = useSync()
  const [route, setRoute] = useLocalStorage('route', '/billing')
  const [error, setError] = useStore(errorStore)
  const location = useLocation()
  useEffect(() => setRoute(location), [location])

  useMount(() => {
    // This is required as extensions load the route as `/popup.html` by default
    navigate(route)

    // Fetch voices in-case the session has become invalid
    chrome.runtime.sendMessage({ id: 'fetchVoices' })
  })

  function handleIssueCreation() {
    window.open(`https://github.com/pgmichael/wavenet-for-chrome/issues/new?title=${error.errorCode}&body=${error.errorMessage}`)
  }

  if (!ready) return null

  return (
    <div style={{ width: 586, height: 550 }} className="bg-neutral-50 bg-opacity-50 flex">
      <Sidebar />
      <div className="w-full p-4 overflow-y-scroll bg-neutral-100 bg-opacity-60">
        <Routes>
          <Route path="/billing" element={<Billing />} />
          <Route path="/usage" element={<Usage />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/sandbox" element={<Sandbox />} />
        </Routes>
      </div>
      {
        error && <Dialog
          title={error.errorTitle}
          content={error.errorMessage}
          onClose={() => setError(null)}
          buttons={[
            <Button className="max-w-fit" onClick={() => setError(null)}>Close</Button>,
            <Button className="max-w-fit" type="primary" Icon={GitHub} onClick={handleIssueCreation}>Create an issue</Button>
          ]}
        />
      }
    </div>
  )
}
