// Event listeners -------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (!request) return
  const { id, payload } = request

  if (!handlers[id]) throw new Error(`No handler for ${id}`)

  console.log('Handling message', { id, payload })
  handlers[id](payload)
})

// Handlers --------------------------------------------------------------------
const handlers = {
  error: function(payload) {
    window.alert(`Wavenet for Chrome Error: ${payload.message}`)
  }
}
