// Text helpers
export function splitSentences(text: string): string[] {
  const regex = new RegExp(/["’]?[A-Z][^.?!]+((?![.?!][’"]?\s["’]?[A-Z][^.?!]).)+[.?!’"]+/g)
  let matches: string[] = []

  let currentMatch: RegExpExecArray;
  while (currentMatch = regex.exec(text)) matches.push(currentMatch[0])

  if (matches.length < 1) return [text]

  return matches
}

export function isSSML(text: string) {
  return text.startsWith('<speak>') && text.endsWith('</speak>')
}

// Chrome extension helpers
export type AudioEncoding =
  | PlaybackEncoding
  | DownloadEncoding

type PlaybackEncoding = "OGG_OPUS"
type DownloadEncoding = "MP3"

export interface ExtensionSettings {
  apiKey: string

  pitch: string
  speed: string
  locale: string
}

export async function getExtensionSettings(): Promise<ExtensionSettings> {
  let promiseResolver: Function
  let settings: Promise<ExtensionSettings> = new Promise((resolve, _) => promiseResolver = resolve)

  chrome.storage.sync.get(null, async settings => promiseResolver(settings))

  if (!extensionSettingsAreValid((await settings) as ExtensionSettings))
    throw new Error("Extensions settings are are invalid.")

  return await settings
}


export function extensionSettingsAreValid(settings: ExtensionSettings): boolean {
  if (!settings.apiKey) {
    alert(`You must add your Google Cloud's text-to-speech API Key in the extension's popup.`)

    return false
  }

  return true
}