import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
import './helpers/text-helpers.js'
import { fileExtMap } from './helpers/file-helpers.js'

// Local state -----------------------------------------------------------------
let queue = []
let playing = false

let bootstrappedResolver = null
const bootstrapped = new Promise((resolve) => (bootstrappedResolver = resolve))

// Bootstrap -------------------------------------------------------------------
initializeSentry()
;(async function Bootstrap() {
  await migrateSyncStorage()
  await handlers.fetchVoices()
  await setDefaultSettings()
  await createContextMenus()
  bootstrappedResolver()
})()

// Event listeners -------------------------------------------------------------
chrome.commands.onCommand.addListener(function (command) {
  console.log('Handling command...', ...arguments)

  if (!handlers[command]) throw new Error(`No handler found for ${command}`)
  handlers[command]()

  return true
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Handling message...', ...arguments)

  const { id, payload } = request

  if (!handlers[id]) throw new Error(`No handler found for ${id}`)
  handlers[id](payload).then(sendResponse)

  return true
})

chrome.storage.onChanged.addListener(function (changes) {
  console.log('Handling storage change...', ...arguments)

  if (!changes.downloadEncoding) return

  updateContextMenus()
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  console.log('Handling context menu click...', ...arguments)

  const id = info.menuItemId
  const payload = { text: info.selectionText }

  if (!handlers[id]) throw new Error(`No handler found for ${id}`)
  handlers[id](payload).then((result) =>
    chrome.tabs.sendMessage(tab.id, result)
  )

  return true
})

// Handlers --------------------------------------------------------------------
const handlers = {
  readAloud: async function ({ text }) {
    console.log('Reading aloud...', ...arguments)

    if (playing) this.stopReading()
    await createOffscreenDocument()

    const chunks = text.chunk()
    queue.push(...chunks)

    playing = true
    updateContextMenus()

    let count = 0
    const sync = await chrome.storage.sync.get()
    const encoding = sync.readAloudEncoding
    const prefetchQueue = []
    while (queue.length) {
      const text = queue.shift()
      const nextText = queue[0]

      if (nextText) {
        prefetchQueue.push(this.getAudioUri({ text: nextText, encoding }))
      }

      const audioUri =
        count === 0
          ? await this.getAudioUri({ text, encoding })
          : await prefetchQueue.shift()

      await chrome.runtime.sendMessage({
        id: 'play',
        payload: { audioUri },
        offscreen: true,
      })

      console.log('Play through of audio complete. Enqueuing next chunk.')
      count++
    }

    playing = false
    updateContextMenus()
  },
  readAloudShortcut: async function () {
    console.log('Handling read aloud shortcut...', ...arguments)

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: retrieveSelection,
    })
    const text = result[0].result

    if (playing) {
      this.stopReading()

      if (!text) return
    }

    this.readAloud({ text }).catch((error) => {
      this.stopReading()
      throw error
    })
  },
  stopReading: async function () {
    console.log('Stopping reading...', ...arguments)

    queue = []
    chrome.runtime.sendMessage({ id: 'stop', payload: {}, offscreen: true })
    playing = false
    updateContextMenus()
  },
  download: async function ({ text }) {
    console.log('Downloading audio...', ...arguments)

    const { downloadEncoding: encoding } = await chrome.storage.sync.get()
    const url = await this.getAudioUri({ text, encoding })
    await chrome.downloads.download({
      url,
      filename: `something.${fileExtMap[encoding]}`,
    })
  },
  downloadShortcut: async function () {
    console.log('Handling download shortcut...', ...arguments)

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: retrieveSelection,
    })
    const text = result[0].result

    this.download({ text })
  },
  synthesize: async function ({ text, encoding }) {
    console.log('Synthesizing text...', ...arguments)

    const sync = await chrome.storage.sync.get()
    const voice = sync.voices[sync.language]
    const count = text.length

    if (!sync.apiKey || !sync.apiKeyValid) {
      await sendMessageToCurrentTab({
        id: 'error',
        payload: {
          title: 'API key is missing or invalid',
          message: 'Ensure your API key is valid and try again.',
        },
      })

      throw new Error('API key is missing or invalid')
    }

    let ssml
    if (text.isSSML()) {
      ssml = text
      text = undefined
    }

    const response = await fetch(
      `${await getApiUrl()}/text:synthesize?key=${sync.apiKey}`,
      {
        method: 'POST',
        body: JSON.stringify({
          audioConfig: {
            audioEncoding: encoding,
            pitch: sync.pitch,
            speakingRate: sync.speed,
          },
          input: { text, ssml },
          voice: { languageCode: sync.language, name: voice },
        }),
      }
    )

    if (!response.ok) {
      const message = (await response.json()).error?.message

      await sendMessageToCurrentTab({
        id: 'error',
        payload: { title: 'Failed to synthesize text', message },
      })

      throw new Error(message)
    }

    const audioContent = (await response.json()).audioContent

    // TODO(mike): pass more details about the request to the analytics endpoint
    // so we can better understand how the extension is being used.
    fetch('https://tunnel.pgmichael.com/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'audio',
        method: 'post',
        body: {
          count,
          audioConfig: {
            audioEncoding: encoding,
            pitch: sync.pitch,
            speakingRate: sync.speed,
          },
          voice: { languageCode: sync.language, name: voice },
        },
      }),
    })

    return audioContent
  },
  getAudioUri: async function ({ text, encoding }) {
    console.log('Getting audio URI...', ...arguments)

    const chunks = text.chunk()
    const promises = chunks.map((text) => this.synthesize({ text, encoding }))
    const audioContents = await Promise.all(promises)
    return `data:audio/${fileExtMap[encoding]};base64,` + audioContents.join()
  },
  fetchVoices: async function () {
    console.log('Fetching voices...', ...arguments)

    try {
      const sync = await chrome.storage.sync.get()
      const baseUrl = await getApiUrl()
      const response = await fetch(`${baseUrl}/voices?key=${sync.apiKey}`)

      const voices = (await response.json()).voices
      if (!voices) throw new Error('No voices found')

      await chrome.storage.session.set({ voices })
      await setLanguages()

      return voices
    } catch (e) {
      console.warn('Failed to fetch voices', e)
      return false
    }
  },
}

// Helpers ---------------------------------------------------------------------
async function updateContextMenus() {
  console.log('Updating context menus...', { playing })

  // Prevents context menus from being updated before they are created
  await bootstrapped

  try {
    chrome.contextMenus.update('readAloud', { enabled: true })
    chrome.contextMenus.update('stopReading', { enabled: playing })

    const fileExt =
      fileExtMap[(await chrome.storage.sync.get()).downloadEncoding]
    const title = `Download ${fileExt.toUpperCase()}`
    chrome.contextMenus.update('download', { title })
  } catch (e) {
    Sentry.captureException(e)
  }
}

async function createContextMenus() {
  console.log('Creating context menus...', ...arguments)

  chrome.contextMenus.removeAll()

  const commands = await chrome.commands.getAll()
  const readAloudShortcut = commands.find(
    (c) => c.name === 'readAloudShortcut'
  )?.shortcut
  const downloadShortcut = commands.find(
    (c) => c.name === 'downloadShortcut'
  )?.shortcut

  let title = 'Read aloud'
  if (readAloudShortcut) title += ` (${readAloudShortcut})`
  chrome.contextMenus.create({
    id: 'readAloud',
    title,
    contexts: ['selection'],
    enabled: !playing,
  })

  title = 'Stop reading'
  if (readAloudShortcut) title += ` (${readAloudShortcut})`
  chrome.contextMenus.create({
    id: 'stopReading',
    title,
    contexts: ['all'],
    enabled: playing,
  })

  const fileExt = fileExtMap[(await chrome.storage.sync.get()).downloadEncoding]
  title = `Download ${fileExt.toUpperCase()}`
  if (downloadShortcut) title += ` (${downloadShortcut})`
  chrome.contextMenus.create({
    id: 'download',
    title,
    contexts: ['selection'],
  })
}

async function createOffscreenDocument() {
  console.log('Creating offscreen document...', ...arguments)

  const documentAlreadyExists = await hasOffscreenDocument(
    'assets/offscreen.html'
  )
  if (documentAlreadyExists) {
    return
  }

  await chrome.offscreen.createDocument({
    url: 'assets/offscreen.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Plays synthesized audio in the background',
  })
}

async function hasOffscreenDocument(path) {
  console.log('Checking if offscreen document exists...', ...arguments)

  const offscreenUrl = chrome.runtime.getURL(path)
  // eslint-disable-next-line no-undef
  const matchedClients = await clients.matchAll()

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) return true
  }

  console.warn('Offscreen document not found.')
  return false
}

function initializeSentry() {
  console.log('Initializing Sentry...', ...arguments)

  // Nasty hack to make sentry work using Manifest V3
  // https://github.com/getsentry/sentry-javascript/issues/5289#issuecomment-1368705821
  // noinspection JSConstantReassignment
  Sentry.WINDOW.document = {
    visibilityState: 'hidden',
    addEventListener: () => {},
  }

  Sentry.init({
    dsn: 'https://1ff01a53014a4671ba548e9b431e2b15@o516851.ingest.sentry.io/5623837',
    release: chrome.runtime.getManifest().version,
    environment: process.env.ENVIROMENT || 'development',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    beforeSend: function (event) {
      if (event.user?.ip_address) delete event.user.ip_address
      if (event.request?.url) delete event.request.url
      return event
    },
  })
}

export async function setDefaultSettings() {
  console.log('Setting default settings...', ...arguments)

  await chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
  })

  const sync = await chrome.storage.sync.get()
  await chrome.storage.sync.set({
    language: sync.language || 'en-US',
    speed: sync.speed || 1,
    pitch: sync.pitch || 0,
    voices: sync.voices || { 'en-US': 'en-US-Wavenet-A' },
    readAloudEncoding: sync.readAloudEncoding || 'OGG_OPUS',
    downloadEncoding: sync.downloadEncoding || 'MP3',
    apiKey: sync.apiKey || '',
  })
}

async function migrateSyncStorage() {
  console.log('Migrating sync storage...', ...arguments)

  const sync = await chrome.storage.sync.get()

  // Extension with version 8 had WAV and OGG_OPUS as a download option, but
  // it was rolled back in version 9. Due to audio stiching issues.
  if (
    Number(chrome.runtime.getManifest().version) <= 9 &&
    (sync.downloadEncoding == 'OGG_OPUS' || sync.downloadEncoding == 'LINEAR16')
  ) {
    chrome.storage.sync.set({ downloadEncoding: 'MP3_64_KBPS' })
  }

  // Extensions with version < 8 had a different storage structure.
  // We need to migrate them to the new structure before we can use them.
  if (sync.voices || Number(chrome.runtime.getManifest().version) < 8) return

  await chrome.storage.sync.clear()

  const newSync = {}
  if (sync.locale) {
    const oldVoiceParts = sync.locale.split('-')
    newSync.language = [oldVoiceParts[0], oldVoiceParts[1]].join('-')
    newSync.voices = { [newSync.language]: sync.locale }
  }

  if (sync.speed) {
    newSync.speed = Number(sync.speed)
  }

  if (sync.pitch) {
    newSync.pitch = 0
  }

  if (sync.apiKey) {
    newSync.apiKey = sync.apiKey
    newSync.apiKeyValid = true // Assume the old key is valid until proven otherwise
  }

  await chrome.storage.sync.set(newSync)
}

async function setLanguages() {
  console.log('Setting languages...', ...arguments)

  const session = await chrome.storage.session.get()

  if (!session.voices) {
    throw new Error('No voices found. Cannot set languages.')
  }

  const languages = new Set(
    session.voices.map((voice) => voice.languageCodes).flat()
  )

  await chrome.storage.session.set({ languages: Array.from(languages) })

  return languages
}

function retrieveSelection() {
  console.log('Retrieving selection...', ...arguments)

  const activeElement = document.activeElement
  const selectionContents = window.getSelection()?.getRangeAt(0).cloneContents()
  const imgElements = selectionContents.querySelectorAll('img')
  const activeElementIsInput =
    activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'

  if (activeElementIsInput) {
    const start = activeElement.selectionStart
    const end = activeElement.selectionEnd

    return activeElement.value.slice(start, end)
  }

  for (const img of imgElements) {
    const altText = document.createTextNode(img.alt)
    img.parentNode.replaceChild(altText, img)
  }

  return selectionContents.textContent
}

async function getApiUrl() {
  console.log('Getting API URL...', ...arguments)

  return 'https://texttospeech.googleapis.com/v1beta1'
}

async function sendMessageToCurrentTab(event) {
  console.log('Sending message to current tab...', ...arguments)

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTab = tabs[0]

  if (!currentTab)
    throw new Error('No active tab found. Cannot send message to current tab.')

  return chrome.tabs.sendMessage(currentTab.id, event)
}
