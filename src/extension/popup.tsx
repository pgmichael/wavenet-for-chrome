import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { Extension } from './extension'

const root = createRoot(document.getElementById('root'))

root.render(
  <MemoryRouter>
    <Extension />
  </MemoryRouter>,
)
