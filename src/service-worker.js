import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
import './helpers/text-helpers.js'
import { fileExtMap } from './helpers/file-helpers.js'

// Local state -----------------------------------------------------------------
const queue = []
let playing = false;

// Bootstrapper ----------------------------------------------------------------
(async function Bootstrap() {
  console.time('Bootstrap')
  console.log('Bootstrapping service worker...')

  await initializeSentry()
  await migrateSyncStorage()
  await handlers.fetchVoices()
  await setDefaultSettings()
  await createContextMenus()

  await createShortcutsEventListeners()
  await createPopupEventListeners()
  await createOffscreenDocument()
  await createStorageListener()

  console.timeEnd('Bootstrap')
})()

// Handlers --------------------------------------------------------------------
const handlers = {
  readAloud: async function({ text }) {
    if (playing) this.stopReading()

    const chunks = text.chunk()
    console.log('Reading aloud the following text', chunks)
    queue.push(...chunks)
    if (playing) return

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

      const audioUri = count === 0
        ? await this.getAudioUri({ text, encoding })
        : await prefetchQueue.shift()

      await createOffscreenDocument()
      await chrome.runtime.sendMessage({
        id: 'play',
        payload: { audioUri },
        offscreen: true
      })

      console.log('Play through of audio complete. Enqueuing next chunk.')
      count++
    }

    playing = false
    updateContextMenus()
  },
  readAloudShortcut: async function() {
    if (playing) return this.stopReading()

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: retrieveSelection })
      target: { tabId: tab.id },
      func: retrieveSelection
    })
    const text = result[0].result

    this.readAloud({ text }).catch((error) => {
      this.stopReading()
      throw error
    })
  },
  stopReading: async function() {
    queue.length = 0
    await createOffscreenDocument()
    chrome.runtime.sendMessage({ id: 'stop', payload: {}, offscreen: true }).catch()
    playing = false
    updateContextMenus()
  },
  download: async function({ text }) {
    const { downloadEncoding: encoding } = await chrome.storage.sync.get()
    const url = await this.getAudioUri({ text, encoding })
    await chrome.downloads.download({ url, filename: `something.${fileExtMap[encoding]}` })
  },
  downloadShortcut: async function() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: retrieveSelection
    })
    const text = result[0].result

    this.download({ text })
  },
  synthesize: async function({ text, encoding }) {
    const sync = await chrome.storage.sync.get()
    const voice = sync.voices[sync.language]
    const count = text.length

    if (!sync.apiKey || !sync.apiKeyValid) {
      return dispatch({
        id: 'error',
        payload: {
          title: 'API key is missing or invalid',
          message: 'Ensure your API key is valid and try again.'
        }
      })
    }

    let ssml
    if (text.isSSML()) {
      ssml = text
      text = undefined
    }

    const response = await fetch(`${await getApiUrl()}/text:synthesize?key=${sync.apiKey}`, {
      method: 'POST',
      body: JSON.stringify({
        audioConfig: { audioEncoding: encoding, pitch: sync.pitch, speakingRate: sync.speed },
        input: { text, ssml },
        voice: { languageCode: sync.language, name: voice }
      })
    })

    if (!response.ok) {
      const message = (await response.json()).error?.message

      return dispatch({
        id: 'error',
        payload: { title: 'Failed to synthesize text', message }
      })
    }

    const audioContent = (await response.json()).audioContent

    // TODO(mike): pass more details about the request to the analytics endpoint
    // so we can better understand how the extension is being used.
    fetch('https://tunnel.pgmichael.com/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'textToSpeech', count })
    })

    return audioContent
  },
  getAudioUri: async function({ text, encoding }) {
    const chunks = text.chunk()
    const promises = chunks.map((text) => this.synthesize({ text, encoding }))
    const audioContents = await Promise.all(promises)
    const base64 = audioContents.map((content) => atob(content)).join()
    return `data:audio/${fileExtMap[encoding]};base64,` + btoa(base64)
  },
  fetchVoices: async function() {
    console.log('Fetching voices...')
    try {
      const sync = await chrome.storage.sync.get()
      const baseUrl = await getApiUrl()
      const response = await fetch(`${baseUrl}/voices?key=${sync.apiKey}`)
      const voices = (await response.json()).voices

      if (!voices) {
        throw new Error('No voices found')
      }

      await chrome.storage.session.set({ voices })
      await setLanguages()

      return voices
    } catch (e) {
      console.warn('Failed to fetch voices', e)
      return false
    }
  },
  ping: function() {
    return 'pong'
  }
}

// Helpers ---------------------------------------------------------------------
async function updateContextMenus() {
  console.log('Updating context menus...', { playing })

  try {
    chrome.contextMenus.update('readAloud', { enabled: true })
    chrome.contextMenus.update('stopReading', { enabled: playing })

    const fileExt = fileExtMap[(await chrome.storage.sync.get()).downloadEncoding]
    const title = `Download ${fileExt.toUpperCase()}`
    chrome.contextMenus.update('download', { title })
  } catch (e) {
    Sentry.captureException(e)
  }
}

async function createContextMenus() {
  console.log('Creating context menus...')

  const commands = await chrome.commands.getAll()
  const readAloudShortcut = commands.find(c => c.name === 'readAloudShortcut')?.shortcut
  const downloadShortcut = commands.find(c => c.name === 'downloadShortcut')?.shortcut

  let title = 'Read aloud'
  if (readAloudShortcut) title += ` (${readAloudShortcut})`
  chrome.contextMenus.create({
    id: 'readAloud',
    title,
    contexts: ['selection'],
    enabled: !playing
  })

  title = 'Stop reading'
  if (readAloudShortcut) title += ` (${readAloudShortcut})`
  chrome.contextMenus.create({
    id: 'stopReading',
    title,
    contexts: ['all'],
    enabled: playing
  })

  const fileExt = fileExtMap[(await chrome.storage.sync.get()).downloadEncoding]
  title = `Download ${fileExt.toUpperCase()}`
  if (downloadShortcut) title += ` (${downloadShortcut})`
  chrome.contextMenus.create({
    id: 'download',
    title,
    contexts: ['selection']
  })

  async function handleMessage({ info, tab }) {
    const id = info.menuItemId
    const payload = { text: info.selectionText }

    console.log('Handling message', { id, payload })

    await createOffscreenDocument()

    if (!handlers[id]) {
      throw new Error(`No handler found for ${id}`)
    }

    const result = await handlers[id](payload)

    chrome.tabs.sendMessage(tab.id, result).catch((error) => console.warn(error))
  }

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    handleMessage({ info, tab })

    return true
  })
}

async function createOffscreenDocument() {
  console.log('Creating offscreen document...')
  const path = 'assets/offscreen.html'
  if (await hasOffscreenDocument(path)) return

  try {
    await chrome.offscreen.createDocument({
      url: 'assets/offscreen.html',
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'Play synthesized audio in the background'
    })
  } catch (error) {
    // Ignore error if document already exists
    console.warn(error)
  }
}

async function hasOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path)
  // eslint-disable-next-line no-undef
  const matchedClients = await clients.matchAll()

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) return true
  }

  console.warn('Offscreen document not found.')
  return false
}

export async function initializeSentry() {
  console.log('Initializing Sentry...')

  // Nasty hack to make sentry work using Manifest V3
  // https://github.com/getsentry/sentry-javascript/issues/5289#issuecomment-1368705821
  // noinspection JSConstantReassignment
  Sentry.WINDOW.document = {
    visibilityState: 'hidden',
    addEventListener: () => {
    }
  }

  Sentry.init({
    dsn: 'https://1ff01a53014a4671ba548e9b431e2b15@o516851.ingest.sentry.io/5623837',
    release: chrome.runtime.getManifest().version,
    environment: process.env.ENVIROMENT || 'development',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    beforeSend: function(event) {
      if (event.user?.ip_address) delete event.user.ip_address
      if (event.request?.url) delete event.request.url
      return event
    }
  })
}

export async function setDefaultSettings() {
  console.log('Setting default settings...')
  await chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
  const sync = await chrome.storage.sync.get()
  await chrome.storage.sync.set({
    language: sync.language || 'en-US',
    speed: sync.speed || 1,
    pitch: sync.pitch || 0,
    voices: sync.voices || { 'en-US': 'en-US-Wavenet-A' },
    readAloudEncoding: sync.readAloudEncoding || 'OGG_OPUS',
    downloadEncoding: sync.downloadEncoding || 'MP3',
    apiKey: sync.apiKey || ''
  })
}

async function migrateSyncStorage() {
  console.log('Migrating sync storage if needed...')
  const sync = await chrome.storage.sync.get()

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
  console.log('Setting languages...')

  const session = await chrome.storage.session.get()

  if (!session.voices) {
    throw new Error('No voices found. Cannot set languages.')
  }

  const languages = new Set(session.voices.map(voice => voice.languageCodes).flat())

  await chrome.storage.session.set({ languages: Array.from(languages) })

  return languages
}

async function createShortcutsEventListeners() {
  console.log('Creating shortcut event listeners...')

  async function handleMessage(command) {
    try {
      console.log('Handling command', command)
      await createOffscreenDocument()
      await handlers[command]()
    } catch (e) {
      if (e.message === 'Cannot access a chrome:// URL') {
        console.warn(e.message)
        return
      }

      throw e
    }
  }

  chrome.commands.onCommand.addListener(function(command) {
    handleMessage(command)

    return true
  })
}

function retrieveSelection() {
  const activeElement = document.activeElement
  const selectionContents = window.getSelection()?.getRangeAt(0).cloneContents()
  const imgElements = selectionContents.querySelectorAll('img')
  const activeElementIsInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'

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

async function createPopupEventListeners() {
  console.log('Creating popup event listeners...')

  async function handleMessage(request, sender, sendResponse) {
    console.log('Handling message', request)
    const { id, payload } = request
    await createOffscreenDocument()
    if (!handlers[id]) throw new Error(`No handler found for ${id}`)
    const result = await handlers[id](payload)
    sendResponse(result)
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    handleMessage(request, sender, sendResponse)

    return true
  })
}

async function getApiUrl() {
  return 'https://texttospeech.googleapis.com/v1beta1'
}

async function dispatch(event, { context } = {}) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTab = tabs[0]

  chrome.tabs.sendMessage(currentTab.id, event, () => {
  })
}

function createStorageListener() {
  chrome.storage.onChanged.addListener(function(changes) {
    const value = changes.downloadEncoding
    if (!value) return

    updateContextMenus()
  })
}
