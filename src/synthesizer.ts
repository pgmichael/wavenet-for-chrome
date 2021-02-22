import { splitSentences, getExtensionSettings, isSSML, AudioEncoding } from "./helpers"

class Synthesizer {
  private audioElement: HTMLAudioElement

  constructor() {
    this.audioElement = new Audio()
    this.audioElement.src = ''
  }

  public async download(text: string) {
    if (!text) return

    // TODO: SSML support for text with over 5000 characters.
    if (isSSML(text)) {
      const fetchedAudio = await fetch(`data:audio/mp3;base64,${await this.textToSpeech(text, 'MP3')}`)

      const blob = await fetchedAudio.blob()

      chrome.downloads.download({ url: URL.createObjectURL(blob), filename: `download.mp3` })

      return
    }

    const sentences = splitSentences(text)

    const audioPromiseArray = sentences.map(async x => await this.textToSpeech(x, "MP3"))

    const audioArray = await Promise.all(audioPromiseArray)

    const concatenatedAudio = audioArray.map(x => atob(x)).join()

    const blob = await (await fetch("data:audio/mp3;base64," + btoa(concatenatedAudio))).blob()

    chrome.downloads.download({ url: URL.createObjectURL(blob), filename: `download.mp3` })
  }

  public async start(text: string) {
    if (!text) {
      this.stop()

      return
    }

    // TODO: SSML support for text with over 5000 characters.
    if (isSSML(text)) {
      this.play(await this.textToSpeech(text, "OGG_OPUS"))

      return
    }

    this.playbackTextQueue(splitSentences(text).reverse())
  }

  private async playbackTextQueue(queue: string[], carry: Promise<string> | string = null) {
    this.audioElement.onended = () => this.playbackTextQueue(queue, carry)

    const poppedElement = queue.pop()

    if (typeof poppedElement === 'undefined') {
      this.stop()

      return
    }

    if (carry == null) carry = await this.textToSpeech(poppedElement, "OGG_OPUS")

    this.play(await carry)

    const nextElement = queue[queue.length - 1]

    if (nextElement != null) carry = this.textToSpeech(nextElement, "OGG_OPUS")
  }

  public stop() {
    this.audioElement.src = ''

    chrome.contextMenus.update('stop', { enabled: false })
  }

  private play(audio: string) {
    this.audioElement.src = `data:audio/ogg;base64,${audio}`
    this.audioElement.play()

    chrome.contextMenus.update('stop', { enabled: true })
  }

  private async textToSpeech(text: string, encoding: AudioEncoding): Promise<string> {
    const settings = await getExtensionSettings()

    let request = {
      audioConfig: {
        audioEncoding: encoding,
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
    )

    let json = await response.json()

    if (!response.ok) {
      alert(json.error.message) // TODO: Better error handling
      return
    }

    return json.audioContent
  }
}

export default new Synthesizer()