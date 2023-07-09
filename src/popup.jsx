import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { App } from './components/App.jsx'

const root = createRoot(document.getElementById('root'))

root.render(
  <MemoryRouter>
    <App/>
  </MemoryRouter>
)
