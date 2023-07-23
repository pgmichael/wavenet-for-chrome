import { initializeSentry } from './helpers/sentry-helpers'

// Local variables -------------------------------------------------------------
let audioElement = new Audio()
let shouldPlay = false

// Bootstrap -------------------------------------------------------------------
initializeSentry()

// Event listeners -------------------------------------------------------------
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (!request) return

  const { id, payload, offscreen } = request
  if (!offscreen) return

  if (!handlers[id]) throw new Error(`No handler for ${id}`)
  handlers[id](payload).then(sendResponse)

  return true
})

// Handlers --------------------------------------------------------------------
const handlers = {
  play: function ({ audioUri }) {
    return new Promise((resolve, reject) => {
      if (!audioUri) reject('No audioUri provided')

      shouldPlay = true

      audioElement.src = audioUri
      audioElement.onloadedmetadata = function () {
        if (!shouldPlay) {
          resolve('Playback was stopped before audio could start')
          return
        }

        audioElement
          .play()
          .catch((e) => reject('Error while trying to play audio', e))
      }

      audioElement.onerror = function () {
        reject(`Error loading audio source: ${audioUri}`)
      }

      audioElement.onended = function () {
        resolve(`Finished playing`)
      }
    })
  },
  stop: function () {
    return new Promise((resolve) => {
      shouldPlay = false

      if (!audioElement.paused) {
        audioElement.pause()
        audioElement.currentTime = 0

        resolve('Stopped audio')
        return
      }

      resolve('No audio is currently playing')
    })
  },
}
