class WaveNet {
	constructor() {
		this.speaker = new Audio();
		this.speaker.src = '';
	}

	start(string) {
		chrome.storage.sync.get(null, async (settings) => {
			if (!this.validateSettings(settings)) {
				return
			}

			let request = JSON.stringify({
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
			});

			let response = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${settings.apiKey}`, { method: 'POST', body: request });
			let json = await response.json();
			if (!response.ok) {
				// TODO: Better error handling
				alert(json.error.message);
				return;
			}

			this.speaker.src = `data:audio/wav;base64,${json.audioContent}`;
			this.speaker.play();
		});
	}

	validateSettings(settings) {
		if (settings.apiKey === undefined) {
			alert(`You must add your Google Cloud's text-to-speech API Key in the extension's popup.`);
			return false
		}

		return true;
	}

	stop() {
		this.speaker.src = '';
	}
}

const waveNet = new WaveNet();

chrome.contextMenus.create({
	title: 'Read this by WaveNet for Chrome',
	contexts: ['selection'],
	onclick: (info) => {
		waveNet.start(info.selectionText);
	}
});