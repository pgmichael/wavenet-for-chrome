import * as React from 'react'
import { Heartbeat } from './helpers/heartbeat.js';

// Bootstrapper ----------------------------------------------------------------
(async function Bootstrap() {
  await addEventListeners()
  Heartbeat()
})()

// Handlers --------------------------------------------------------------------
const handlers = {
  error: function(payload) {
    window.alert(`Wavenet for Chrome Error: ${payload.message}`)
  }
}

// Helpers ---------------------------------------------------------------------
async function handleMessage(request, sender, sendResponse) {
  if (!request) return
  const { id, payload } = request
  console.log('Handling message', { id, payload })

  const result = await handlers[id](payload)
  sendResponse(result)
}

async function addEventListeners() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    handleMessage(request, sender, sendResponse)

    return true
  })
}
