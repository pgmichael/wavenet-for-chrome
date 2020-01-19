import ID3Writer from "browser-id3-writer";
import getBlobDuration from 'get-blob-duration'

export default class WaveNet {
  speaker: HTMLAudioElement;

  constructor() {
    this.speaker = new Audio()
    this.speaker.src = ''
    this.speaker.addEventListener("ended", () => this.stop())
  }

  public download(input: string) {
    chrome.storage.sync.get(null, async (settings) => {
      if (!this.validateSettings(settings)) return

      let audioContent = await this.getAudioContent(settings, input)
      if (audioContent === null) return

      const writer = new ID3Writer(Uint8Array.from(atob(audioContent), c => c.charCodeAt(0)))
      writer.setFrame('TLEN', Math.floor(await getBlobDuration(writer.getBlob()) * 1000))
      writer.addTag();

      chrome.downloads.download({
        url: URL.createObjectURL(writer.getBlob()),
        filename: 'download.mp3'
      })
    })
  }

  public async start(input: string) {
    chrome.storage.sync.get(null, async (settings) => {
      if (!this.validateSettings(settings)) return

      let audioContent = await this.getAudioContent(settings, input)
      this.speaker.src = `data:audio/ogg;base64,${audioContent}`
      await this.speaker.play()
      chrome.contextMenus.update('stop', { enabled: true })
    })
  }

  public stop() {
    this.speaker.src = ''
    chrome.contextMenus.update('stop', { enabled: false })
  }

  private async getAudioContent(settings, input: string): Promise<string> {
    let request = {
      audioConfig: {
        audioEncoding: 'OGG_OPUS',
        pitch: settings.pitch,
        speakingRate: settings.speed
      },
      input: {
        text: input,
        ssml: undefined
      },
      voice: {
        languageCode: settings.locale.split('-').slice(0, 2).join('-'),
        name: settings.locale
      }
    }

    if (this.isSSML(input)) {
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

  private validateSettings(settings): boolean {
    if (!settings.apiKey || !settings.locale) {
      alert(`You must add your Google Cloud's text-to-speech API Key in the extension's popup.`)
      return false
    }

    return true
  }

  private isSSML(string): boolean {
    return string.startsWith('<speak>') && string.endsWith('</speak>')
  }
}