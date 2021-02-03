import { splitSentences, getExtensionSettings, isSSML } from "./helpers"

export default class WaveNet {
  private AudioElement: HTMLAudioElement

  constructor() {
    this.AudioElement = new Audio()
    this.AudioElement.src = ''
  }

  public async download(input: string) {
    let audio = await this.fetchFromAPI(input, 'MP3')
    if (audio === null) return

    const blob = await (await fetch(`data:audio/mp3;base64,${audio}`)).blob()

    chrome.downloads.download({ url: URL.createObjectURL(blob), filename: `download.mp3` })
  }

  public async start(text: string) {
    let playbackQueue = splitSentences(text).reverse()

    let cachedAudio = null
    const playNext = async () => {
      this.AudioElement.onended = () => playNext()
      let currentChunk = playbackQueue.pop()

      if (typeof currentChunk === 'undefined') return

      let audio = cachedAudio
      if (audio == null)
        audio = await this.fetchFromAPI(currentChunk, 'OGG_OPUS')

      this.AudioElement.src = `data:audio/ogg;base64,${await audio}`
      this.AudioElement.play()

      const nextChunk = playbackQueue[playbackQueue.length - 1]
      if (nextChunk != null)
        cachedAudio = this.fetchFromAPI(nextChunk, 'OGG_OPUS')
    }

    playNext()

    chrome.contextMenus.update('stop', { enabled: true })
  }

  public stop() {
    this.AudioElement.src = ''

    chrome.contextMenus.update('stop', { enabled: false })
  }

  private async fetchFromAPI(text: string, audioEncoding: string): Promise<string> {
    const settings = await getExtensionSettings()

    let request = {
      audioConfig: {
        audioEncoding: audioEncoding,
        pitch: settings.pitch,
        speakingRate: settings.speed
      },
      input: {
        text: text,
        ssml: undefined
      },
      voice: {
        languageCode: settings.locale.split('-').slice(0, 2).join('-'),
        name: settings.locale
      }
    }

    if (isSSML(text)) {
      request.input.ssml = request.input.text
      delete request.input.text
    }

    let response = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${settings.apiKey}`,
      { method: 'POST', body: JSON.stringify(request) }
    );

    let json = await response.json()
    if (!response.ok) {
      alert(json.error.message) // TODO: Better error handling
      return
    }

    return json.audioContent
  }
}