// Local variables -------------------------------------------------------------
const audioElement = document.createElement('audio')

// Event listeners -------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (!request) return

  const { id, payload, offscreen } = request
  if (!offscreen) return

  if (!handlers[id]) throw new Error(`No handler for ${id}`)
  handlers[id](payload).then(sendResponse)

  return true
})

// Handlers --------------------------------------------------------------------
const handlers = {
  play: async function({ audioUri }) {
    audioElement.src = audioUri
    try {
      await audioElement.play()
    } catch (e) {
      console.log('Failed to play audio', e)
    }

    await new Promise((resolve) => (audioElement.addEventListener('ended', resolve)))
  },
  stop: async function() {
    audioElement.pause()
    audioElement.currentTime = 0
  }
}
