class WaveNet {
	constructor() {
		this.speaker = new Audio();
		this.speaker.src = '';
		this.speaker.addEventListener("ended", () => this.stop())
	}

	download(string) {
		chrome.storage.sync.get(null, async (settings) => {
			if (!this.validateSettings(settings)) return

			let audioContent = await this.getAudioContent(settings, string)
			chrome.downloads.download({
				'url': `data:audio/mp3;base64,${audioContent}`,
				'filename': 'download.mp3'
			})
		})
	}

	async start(string) {
		chrome.storage.sync.get(null, async (settings) => {
			if (!this.validateSettings(settings)) return

			let audioContent = await this.getAudioContent(settings, string)
			this.speaker.src = `data:audio/wav;base64,${audioContent}`
			await this.speaker.play()
			chrome.contextMenus.update('stop', { enabled: true })
		})
	}

	stop() {
		this.speaker.src = ''
		chrome.contextMenus.update('stop', { enabled: false })
	}

	async getAudioContent(settings, string) {
		let request = {
			audioConfig: {
				audioEncoding: 'LINEAR16',
				pitch: settings.pitch,
				speakingRate: settings.speed
			},
			input: {
				text: string
			},
			voice: {
				languageCode: settings.locale.split('-').slice(0, 2).join('-'),
				name: settings.locale
			}
		}

		if (this.isSSML(string)) {
			request.input.ssml = request.input.text
			delete request.input.text
		}

		request = JSON.stringify(request)

		let response = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${settings.apiKey}`, { method: 'POST', body: request });
		let json = await response.json()
		if (!response.ok) {
			alert(json.error.message) // TODO: Better error handling
			return
		}

		return json.audioContent
	}

	validateSettings(settings) {
		if (settings.apiKey === undefined) {
			alert(`You must add your Google Cloud's text-to-speech API Key in the extension's popup.`);
			return false
		}

		return true
	}

	isSSML(string) {
		return string.startsWith('<speak>') && string.endsWith('</speak>')
	}
}

const waveNet = new WaveNet();

chrome.contextMenus.create({
	id: 'start',
	title: 'Start Speaking',
	contexts: ['selection'],
	onclick: info => waveNet.start(info.selectionText)
});

chrome.contextMenus.create({
	id: 'stop',
	title: 'Stop Speaking',
	contexts: ['selection'],
	onclick: _ => waveNet.stop(),
	enabled: false
});

chrome.contextMenus.create({
	id: 'download',
	title: 'Download as MP3',
	contexts: ['selection'],
	onclick: info => waveNet.download(info.selectionText)
});

chrome.commands.onCommand.addListener((command) => {
	if (command === "speak")
		chrome.tabs.executeScript(
			{ code: "window.getSelection().toString();" },
			(selection) => waveNet.start(selection[0])
		)
});