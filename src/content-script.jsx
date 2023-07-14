// Bootstrapper ----------------------------------------------------------------
(async function Bootstrap() {
  addEventListeners()
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

function addEventListeners() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    handleMessage(request, sender, sendResponse)

    return true
  })
}
