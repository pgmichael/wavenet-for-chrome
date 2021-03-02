// Text helpers
export function splitSentences(text: string): string[] {
  return text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/gm)
}

export function isSSML(text: string): boolean {
  return text.startsWith('<speak>') && text.endsWith('</speak>')
}

// Chrome extension helpers
export type AudioEncoding =
  | PlaybackEncoding
  | DownloadEncoding

type PlaybackEncoding = "OGG_OPUS"
type DownloadEncoding = "MP3"

export type ExtensionInformation = {
  version: string,
  environment: string,
}

export async function getExtensionInformation(): Promise<ExtensionInformation> {
  let promiseResolver: Function
  let information: Promise<ExtensionInformation> = new Promise((resolve, _) => promiseResolver = resolve)
  chrome.management.getSelf(information => promiseResolver({
    version: information.version,
    environment: information.installType
  }))

  return await information
}

export type ExtensionSettings = {
  apiKey: string
  pitch: string
  speed: string
  locale: string
}

export async function getExtensionSettings(): Promise<ExtensionSettings> {
  let promiseResolver: Function
  let settings: Promise<ExtensionSettings> = new Promise((resolve, _) => promiseResolver = resolve)

  chrome.storage.sync.get(null, settings => promiseResolver(settings))

  if (!extensionSettingsAreValid((await settings) as ExtensionSettings))
    throw new Error("Extensions settings are are invalid.")

  return await settings
}

export type Commands = chrome.commands.Command

export async function getExtensionCommands(): Promise<Commands[]> {
  let promiseResolver: Function
  let commands: Promise<Commands[]> = new Promise((resolve, _) => promiseResolver = resolve)

  chrome.commands.getAll(commands => promiseResolver(commands))

  return await commands
}

export function extensionSettingsAreValid(settings: ExtensionSettings): boolean {
  if (!settings.apiKey) {
    alert(`You must add your Google Cloud's text-to-speech API Key in the extension's popup.`)

    return false
  }

  return true
}