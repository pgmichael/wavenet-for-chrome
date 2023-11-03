import './helpers/text-helpers.js'
import { fileExtMap } from './helpers/file-helpers.js'
import { initializeSentry } from './helpers/sentry-helpers.js'
import { createError, isError } from './helpers/error-helpers.js'

// Local state -----------------------------------------------------------------
let queue = []
let playing = false
let cancellationToken = false
let bootstrappedResolver = null
const bootstrapped = new Promise((resolve) => (bootstrappedResolver = resolve))

// Bootstrap -------------------------------------------------------------------
initializeSentry();

(async function Bootstrap() {
  await migrateSyncStorage()
  await setDefaultSettings()
  await handlers.fetchVoices()
  await handlers.fetchUser()

  await createContextMenus()
  bootstrappedResolver()
  await pollForPayment()
})()

// Event listeners -------------------------------------------------------------
chrome.commands.onCommand.addListener(function (command) {
  console.log('Handling command...', command)

  if (!handlers[command]) throw new Error(`No handler found for ${command}`)

  handlers[command]()
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Handling message...', request, sender, sendResponse)

  const { id, payload } = request

  if (!handlers[id]) throw new Error(`No handler found for ${id}`)
  handlers[id](payload).then(sendResponse)

  return true
})

chrome.storage.onChanged.addListener(function (changes) {
  console.log('Handling storage change...', changes)

  if (changes.downloadEncoding) {
    updateContextMenus()
  }

  if (changes.paymentSession) {
    pollForPayment()
  }
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  console.log('Handling context menu click...', info, tab)

  const id = info.menuItemId
  const payload = { text: info.selectionText }

  if (!handlers[id]) throw new Error(`No handler found for ${id}`)

  handlers[id](payload)
})

chrome.runtime.onInstalled.addListener(async function (details) {
  console.log('Handling runtime install...', details)

  const self = await chrome.management.getSelf()
  if (details.reason === 'update' && self.installType !== 'development') {
    chrome.tabs.create({ url: 'https://wavenet-for-chrome.com/changelog' })
  }
})

// Handlers --------------------------------------------------------------------
export const handlers = {
  readAloud: async function ({ text }) {
    console.log('Reading aloud...', { text })

    if (playing) await this.stopReading()

    const chunks = text.chunk()
    console.log('Chunked text into', chunks.length, 'chunks', chunks)

    queue.push(...chunks)
    playing = true
    updateContextMenus()

    let count = 0
    const sync = await chrome.storage.sync.get()
    const encoding = sync.readAloudEncoding
    const prefetchQueue = []
    cancellationToken = false
    while (queue.length) {
      if (cancellationToken) {
        cancellationToken = false
        playing = false
        updateContextMenus()
        return
      }

      const text = queue.shift()
      const nextText = queue[0]

      if (nextText) {
        prefetchQueue.push(this.getAudioUri({ text: nextText, encoding }))
      }

      const audioUri =
        count === 0
          ? await this.getAudioUri({ text, encoding })
          : await prefetchQueue.shift()

      try {
        if (isError(audioUri)) return audioUri
        
        await createOffscreenDocument()
        await chrome.runtime.sendMessage({
          id: 'play',
          payload: { audioUri },
          offscreen: true,
        })
      } catch (e) {
        console.warn('Failed to play audio', e)

        // Audio playback may have failed because the user stopped playback, or
        // called the readAloud function again. We need to return early to avoid
        // playing the next chunk.
        return
      }

      console.log('Play through of audio complete. Enqueuing next chunk.')
      count++
    }

    playing = false
    updateContextMenus()
    return Promise.resolve(true)
  },
  readAloudShortcut: async function () {
    console.log('Handling read aloud shortcut...')

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: retrieveSelection,
    })
    const text = result[0].result

    if (playing) {
      await this.stopReading()

      if (!text) return
    }

    this.readAloud({ text })
  },
  stopReading: async function () {
    console.log('Stopping reading...')

    cancellationToken = true
    queue = []
    playing = false
    updateContextMenus()

    try {
      await createOffscreenDocument()
      await chrome.runtime.sendMessage({
        id: 'stop',
        offscreen: true,
      })
    } catch (e) {
      console.warn('Failed to stop audio', e)
    }

    return Promise.resolve(true)
  },
  download: async function ({ text }) {
    console.log('Downloading audio...', { text })

    const { downloadEncoding: encoding } = await chrome.storage.sync.get()
    
    const url = await this.getAudioUri({ text, encoding })
    if (isError(url)) return url

    console.log('Downloading audio from', url)
    
    chrome.downloads.download({
      url,
      filename: `tts-download.${fileExtMap[encoding]}`,
    })

    return Promise.resolve(true)
  },
  downloadShortcut: async function () {
    console.log('Handling download shortcut...')

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: retrieveSelection,
    })
    const text = result[0].result

    this.download({ text })
  },
  synthesize: async function ({ text, encoding }) {
    console.log('Synthesizing text...', { text, encoding })

    const sync = await chrome.storage.sync.get()
    const voice = sync.voices[sync.language]
    const key = sync.mode === 'paid' ? sync.user?.secret_key : sync.apiKey

    let url = `${process.env.BACKEND_URL}/synthesize`
    if (sync.mode !== 'paid') url += `?key=${key}`

    const headers = { 'Content-Type': 'application/json' }
    if (sync.mode === 'paid') headers['Authorization'] = `Bearer ${key}`

    if (!key) {
      const error = createError({
        errorCode: 'MISSING_API_KEY',
        errorMessage: "Missing API key",
        errorTitle: "Your api key is invalid or missing. Please double check it has been entered correctly inside the extension's popup."
      })

      sendMessageToCurrentTab(error)
      
      return error
    }

    let ssml = undefined
    if (text.isSSML()) {
      ssml = text
      text = undefined
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        "text": text,
        "ssml": ssml,
        "voice_name": voice,
        "voice_language_code": sync.language,
        "audio_pitch": sync.pitch,
        "audio_speaking_rate": sync.speed,
        "audio_volume_gain_db": sync.volumeGainDb,
        "audio_encoding": encoding,
        "audio_profile": sync.audioProfile !== 'default' ? [sync.audioProfile] : undefined,
        "extension_version": chrome.runtime.getManifest().version,
      }),
    })

    if (!response.ok) {
      console.log('Failed to synthesize text', response)
      const message = (await response.json()).error?.message

      if (message === 'API key not valid. Please pass a valid API key.') {
        const error = createError({
          errorCode: 'MISSING_API_KEY',
          errorMessage: "Missing API key",
          errorTitle: "Your api key is invalid or missing. Please double check it has been entered correctly inside the extension's popup."
        })
  
        sendMessageToCurrentTab(error)
        
        return error
      }

      // Unknown errors
      const error = createError({
        errorCode: 'FAILED_TO_SYNTHESIZE_TEXT',
        errorTitle: 'An error occured while synthesizing text',
        errorMessage: message
      })

      sendMessageToCurrentTab(error)

      await this.stopReading()
      
      return error
    }

    return (await response.json()).audioContent
  },
  getAudioUri: async function ({ text, encoding }) {
    console.log('Getting audio URI...', { text, encoding })

    const chunks = text.chunk()
    console.log('Chunked text into', chunks.length, 'chunks', chunks)

    const promises = chunks.map((text) => this.synthesize({ text, encoding }))
    const audioContents = await Promise.all(promises)
    const errorContents = audioContents.filter(isError)
    
    if (errorContents.length) {
      return errorContents[0]
    }

    return (
      `data:audio/${fileExtMap[encoding]};base64,` +
      btoa(audioContents.map(atob).join(''))
    )
  },
  validateApiKey: async function () {
    console.log('Validating API key...')
    const sync = await chrome.storage.sync.get()

    try {
      const response = (await fetch(`${process.env.TTS_API_URL}/voices?key=${sync.apiKey}`))
      if (!response.ok) {
        return false
      }
    } catch (e) {
      return false
    }

    return true
  },
  fetchVoices: async function () {
    console.log('Fetching voices...')

    const response = await fetch(`${process.env.BACKEND_URL}/voices`)
    if (!response.ok) throw new Error('Failed to fetch voices')

    const voices = (await response.json())
    if (!voices) throw new Error('No voices found')

    await chrome.storage.session.set({ voices })
    await setLanguages()
    return voices
  },

  // ---------------------------------------------------------------------------
  authenticate: async function () {
    console.log('Authenticating...')
    const authTokenResult = await chrome.identity.getAuthToken({ interactive: true })

    try {
      const userResult = await fetch(`${process.env.BACKEND_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokenResult.token}`,
          'Content-Type': 'application/json'
        }
      })
  
      const user = await userResult.json()
  
      await chrome.storage.sync.set({ user })

      return user
    } catch(e) {
      const error = createError({
        errorCode: 'AUTHENTICATION_FAILED',
        errorTitle: 'Authentication failed',
        errorMessage: 'Please try again later or contact us for more details.'
      })

      return error
    }
  },
  createPaymentSession: async function () {
    console.log('Creating payment session...')

    // Authenticate the user first
    const user = await this.authenticate()
    if (!user) {
      throw new Error('Failed to authenticate user')
    }

    if (user.credits > 0) {
      console.log('User has credits, skipping payment session creation')
      return
    }

    // Return the existing payment session if it exists.
    const session = await chrome.storage.session.get()
    if (session.paymentSession) return session.paymentSession

    const response = await fetch(`${process.env.BACKEND_URL}/payment-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.secret_key}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = createError({
        errorCode: 'FAILED_TO_CREATE_PAYMENT_SESSION',
        errorTitle: 'Failed to create payment session',
        errorMessage: 'Please try again later or contact us for more details.'  
      })

      sendMessageToCurrentTab(error)

      return error
    }

    const paymentSession = await response.json()

    console.log('Payment session result', paymentSession)

    await chrome.storage.session.set({ paymentSession })

    return paymentSession
  },
  fetchUser: async function () {
    const sync = await chrome.storage.sync.get()
    if (!sync.user?.secret_key) return

    const response = await fetch(`${process.env.BACKEND_URL}/users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sync.user.secret_key}` }
    })

    if (!response.ok) throw new Error('Failed to fetch user')

    const user = await response.json()

    await chrome.storage.sync.set({ user })

    return user
  },
  fetchUsage: async function () {
    const sync = await chrome.storage.sync.get()
    if (!sync.user?.secret_key) return

    const response = await fetch(`${process.env.BACKEND_URL}/insights`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sync.user.secret_key}` }
    })

    if (!response.ok) throw new Error('Failed to fetch usage')

    const usage = await response.json()

    return usage
  },
  fetchInvoices: async function () {
    console.log('Fetching invoices...')

    const sync = await chrome.storage.sync.get()
    if (!sync.user?.secret_key) return

    const response = await fetch(`${process.env.BACKEND_URL}/invoices`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sync.user.secret_key}` }
    })

    if (!response.ok) throw new Error('Failed to fetch invoices')

    return response.json()
  }
}

// Helpers ---------------------------------------------------------------------
async function updateContextMenus() {
  console.log('Updating context menus...', { playing })

  // Prevents context menus from being updated before they are created,
  // which causes an unnecessary error in the console.
  await bootstrapped

  const commands = await chrome.commands.getAll()
  const encoding = (await chrome.storage.sync.get()).downloadEncoding
  const fileExt = fileExtMap[encoding]
  const downloadShortcut = commands.find((c) => c.name === 'downloadShortcut')?.shortcut

  chrome.contextMenus.update('readAloud', {
    enabled: true
  })

  chrome.contextMenus.update('stopReading', {
    enabled: playing
  })

  chrome.contextMenus.update('download', {
    title: `Download ${fileExt?.toUpperCase()}${downloadShortcut && ` (${downloadShortcut})`}`,
  })
}

async function createContextMenus() {
  console.log('Creating context menus...')
  chrome.contextMenus.removeAll()


  const commands = await chrome.commands.getAll()
  const readAloudShortcut = commands.find((c) => c.name === 'readAloudShortcut')?.shortcut
  const downloadShortcut = commands.find((c) => c.name === 'downloadShortcut')?.shortcut
  const downloadEncoding = (await chrome.storage.sync.get()).downloadEncoding
  const fileExt = fileExtMap[downloadEncoding]

  chrome.contextMenus.create({
    id: 'readAloud',
    title: `Read aloud${readAloudShortcut && ` (${readAloudShortcut})`}`,
    contexts: ['selection'],
    enabled: !playing,
  })

  chrome.contextMenus.create({
    id: 'stopReading',
    title: `Stop reading${readAloudShortcut && ` (${readAloudShortcut})`}`,
    contexts: ['all'],
    enabled: playing,
  })

  chrome.contextMenus.create({
    id: 'download',
    title: `Download ${fileExt?.toUpperCase()}${downloadShortcut && ` (${downloadShortcut})`}`,
    contexts: ['selection'],
  })
}

let creating
async function createOffscreenDocument() {
  const path = 'public/offscreen.html'

  if (await hasOffscreenDocument(path)) return

  if (creating) {
    await creating
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'Plays synthesized audio in the background',
    })
    await creating
    creating = null
  }
}

async function hasOffscreenDocument(path) {
  console.log('Checking if offscreen document exists...')

  const offscreenUrl = chrome.runtime.getURL(path)
  // @ts-ignore
  const matchedClients = await clients.matchAll()

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) return true
  }

  return false
}

export async function setDefaultSettings() {
  console.log('Setting default settings...')

  await chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
  })

  const sync = await chrome.storage.sync.get()
  await chrome.storage.sync.set({
    language: sync.language || 'en-US',
    speed: sync.speed || 1,
    pitch: sync.pitch || 0,
    voices: sync.voices || { 'en-US': 'en-US-Polyglot-1' },
    readAloudEncoding: sync.readAloudEncoding || 'OGG_OPUS',
    downloadEncoding: sync.downloadEncoding || 'MP3_64_KBPS',
    apiKey: sync.apiKey || '',
    audioProfile: sync.audioProfile || 'default',
    volumeGainDb: sync.volumeGainDb || 0,
    mode: sync.mode || 'paid',
  })
}

async function migrateSyncStorage() {
  console.log('Migrating sync storage...')

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

  const newSync: any = {}
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

  const languages = new Set(
    session.voices.map((voice) => voice.languageCodes).flat()
  )

  await chrome.storage.session.set({ languages: Array.from(languages) })

  return languages
}

function retrieveSelection() {
  console.log('Retrieving selection...')

  const activeElement = document.activeElement
  if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {

    // @ts-ignore
    const start = activeElement.selectionStart
    // @ts-ignore
    const end = activeElement.selectionEnd

    // @ts-ignore
    return activeElement.value.slice(start, end)
  }

  return window.getSelection()?.toString()
}

async function sendMessageToCurrentTab(event) {
  console.log('Sending message to current tab...')

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTab = tabs[0]

  if (!currentTab) {
    console.warn('No current tab found. Aborting message send.')
    return
  }

  return chrome.tabs.sendMessage(currentTab.id, event)
}

// When the session has a payment session and the user doesn't have any credits
// we poll the server every 5 seconds to check if the payment has been processed.
//
// When the payment has been processed we remove the payment session from the
// session storage triggering a re-render of any components that depend on it.
async function pollForPayment() {
  console.log('Polling for payment...')

  const session = await chrome.storage.session.get()
  if (!session.paymentSession) {
    console.log('No payment session found. Aborting poll.')
    return
  }

  const interval = setInterval(async () => {
    console.log('Checking if payment has been processed...')
    const user = await handlers.fetchUser()
    if (user.credits > 0) {
      console.log('Payment has been processed. Removing payment session...')
      await chrome.storage.session.remove('paymentSession')
      clearInterval(interval)
    } else {
      console.log('Payment has not been processed yet...')
    }
  }, 5000)
}
