class WaveNet {
	constructor() {
		this.speaker = new Audio();
		this.speaker.src = '';
	}

	start(string) {
		chrome.storage.sync.get(null, async (settings) => {
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
					languageCode: 'en-US',
					name: settings.voice
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