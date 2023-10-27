import React, { useEffect } from 'react'
import { useSync } from '../hooks/hooks/useSync'
import { useLocalStorage } from '../hooks/hooks/useLocalStorage'
import { useMount } from '../hooks/hooks/useMount'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Billing } from './components/views/Billing'
import { Usage } from './components/views/Usage'
import { Preferences } from './components/views/Preferences'
import { Sandbox } from './components/views/Sandbox'

export function Extension() {
  const navigate = useNavigate()
  const { sync, ready } = useSync()
  const [route, setRoute] = useLocalStorage('route', '/billing')
  const location = useLocation()
  useEffect(() => setRoute(location), [location])

  useMount(() => {
    // This is required as extensions load the route as `/popup.html` by default
    navigate(route)

    // Fetch voices in-case the session has become invalid
    chrome.runtime.sendMessage({ id: 'fetchVoices' })
  })

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
    </div>
  )
}
