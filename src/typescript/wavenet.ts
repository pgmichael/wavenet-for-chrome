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
      
      var paragraphs = []
      
      if(input.length > 4999){
        var curparagraph = ""
        var paralen
        //Taken shamelessly from https://www.sitepoint.com/community/t/choose-whole-sentences-and-only-whole-sentences-reliably-with-regex/8075/4
        var regex1 = new RegExp(/["’]?[A-Z][^.?!]+((?![.?!][’"]?\s["’]?[A-Z][^.?!]).)+[.?!’"]+/g)
        var allsentences
        
        allsentences = regex1.exec(input)
        paralen = curparagraph.length + allsentences[0].length
        while (allsentences) {
          while (paralen < 4999) {
            curparagraph = curparagraph + " " + allsentences[0]
            allsentences = regex1.exec(input);
            if (allsentences != null) {
              paralen = curparagraph.length + allsentences[0].length;
            }
            else {
              break
            }
          }
          paragraphs.push(curparagraph)
          paralen = 0
          curparagraph = ""
        }       

      } else {
        paragraphs.push(input)
      }

      this.getDownloads(paragraphs, settings)
    })
  }

  public async getDownloads(paras, settings)
  {
    var i = 0
    for (const paragraph of paras) {
      let audioContent = await this.getAudioContent(settings, paragraph, 'MP3')
      if (audioContent === null) return
      const digitnumber = ("00" + i).substr(-3,3);

      fetch(`data:audio/mp3;base64,${audioContent}`)
        .then(response => response.blob())
        .then(function (myBlob) {
          chrome.downloads.download({
            url: URL.createObjectURL(myBlob),
            filename: "download" + digitnumber + ".mp3"
        })
      })

      i++
    };    
  }

  public async start(input: string) {
    chrome.storage.sync.get(null, async (settings) => {
      if (!this.validateSettings(settings)) return

      let audioContent = await this.getAudioContent(settings, input, 'OGG_OPUS')
      this.speaker.src = `data:audio/ogg;base64,${audioContent}`
      await this.speaker.play()
      chrome.contextMenus.update('stop', { enabled: true })
    })
  }

  public stop() {
    this.speaker.src = ''
    chrome.contextMenus.update('stop', { enabled: false })
  }

  private async getAudioContent(settings: any, input: string, audioEncoding: string): Promise<string> {
    let request = {
      audioConfig: {
        audioEncoding: audioEncoding,
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