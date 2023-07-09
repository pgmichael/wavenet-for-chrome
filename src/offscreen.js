const audioElement = document.createElement('audio');

// Bootstrapper ----------------------------------------------------------------
(async function Bootstrap() {
  await addEventListeners()
})()

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

// Helpers ---------------------------------------------------------------------
async function handleMessage(request, sender, sendResponse) {
  if (!request) return

  const { id, payload, offscreen } = request
  if (!offscreen) return
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
