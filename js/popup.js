// Supported languages and voices by Cloud Text-to-Speech
const languages = {
	"English": {
		voices: [
			"en-US-Wavenet-A",
			"en-US-Wavenet-B",
			"en-US-Wavenet-C",
			"en-US-Wavenet-D",
			"en-US-Wavenet-E",
			"en-US-Wavenet-F",
			"en-AU-Wavenet-A",
			"en-AU-Wavenet-B",
			"en-AU-Wavenet-C",
			"en-AU-Wavenet-D",
			"en-GB-Wavenet-A",
			"en-GB-Wavenet-B",
			"en-GB-Wavenet-C",
			"en-GB-Wavenet-D",
		]
	},
	"Deutsch": {
		voices: [
			"de-DE-Wavenet-A",
			"de-DE-Wavenet-B",
			"de-DE-Wavenet-C",
			"de-DE-Wavenet-D",
		]
	},
	"Français": {
		voices: [
			"fr-FR-Wavenet-A",
			"fr-FR-Wavenet-B",
			"fr-FR-Wavenet-C",
			"fr-FR-Wavenet-D",
		]
	},
	"Italiano": {
		voices: [
			"it-IT-Wavenet-A",
		]
	},
	"Nederlands": {
		voices: [
			"nl-NL-Wavenet-A",
		]
	},
	"日本語": {
		voices: [
			"ja-JP-Standard-A",
		]
	},
	"Dansk": {
		voices: [
			"da-DK-Wavenet-A"
		]
	},
	"Polskie": {
		voices: [
			"pl-PL-Wavenet-A",
			"pl-PL-Wavenet-B",
			"pl-PL-Wavenet-C",
			"pl-PL-Wavenet-D",
		]
	},
	"Português": {
		voices: [
			"pt-BR-Wavenet-A",
			"pt-PT-Wavenet-A",
			"pt-PT-Wavenet-B",
			"pt-PT-Wavenet-C",
			"pt-PT-Wavenet-D",
		]
	},
	"Pусский": {
		voices: [
			"ru-RU-Wavenet-A",
			"ru-RU-Wavenet-B",
			"ru-RU-Wavenet-C",
			"ru-RU-Wavenet-D",
		]
	},
	"Slovenský": {
		voices: [
			"sk-SK-Wavenet-A",
		]
	},
	"Türk": {
		voices: [
			"tr-TR-Wavenet-A",
			"tr-TR-Wavenet-B",
			"tr-TR-Wavenet-C",
			"tr-TR-Wavenet-D",
			"tr-TR-Wavenet-E",
		]
	},
	"Yкраїнський": {
		voices: [
			"uk-UA-Wavenet-A",
		]
	},
	"한국어": {
		voices: [
			"ko-KR-Wavenet-A",
			"ko-KR-Wavenet-B",
			"ko-KR-Wavenet-C",
			"ko-KR-Wavenet-D",
		]
	},
	"Norsk": {
		voices: [
			"nb-no-Wavenet-A",
			"nb-no-Wavenet-B",
			"nb-no-Wavenet-C",
			"nb-no-Wavenet-D",
			"nb-no-Wavenet-E",
		]
	}
}

let languageInput = document.querySelector('.settings__language');
let localeInput = document.querySelector('.settings__locale');
let speedInput = document.querySelector('.settings__speed');
let pitchInput = document.querySelector('.settings__pitch');
let pitchValue = document.querySelector('.settings__range-value--pitch');
let speedValue = document.querySelector('.settings__range-value--speed');
let apiKeyInput = document.querySelector('.settings__api-key');

function loadLanguages(selectedLanguage) {
	languageInput.innerHTML = ``;
	for (const key of Object.keys(languages)) {
		languageInput.innerHTML += `<option value="${key}">${key}</option>`;
	}
	let selectedOption = document.querySelector(`.settings__language option[value=${selectedLanguage}]`);
	selectedOption.selected = true;
}

function loadLocales() {
	localeInput.innerHTML = ``;
	languages[languageInput.value].voices.forEach(voice => {
		localeInput.innerHTML += `<option value="${voice}">${voice}</option>`;
	});
	localeInput.options[0].selected = true;
}

// Retreive settings upon popup opening. If values are null, set default values.
chrome.storage.sync.get(null, (data) => {
	if (data.apiKey === undefined) {
		chrome.storage.sync.set({ apiKey: "" });
	} else {
		apiKeyInput.value = data.apiKey;
	}

	if (data.language === undefined) {
		chrome.storage.sync.set({ language: 'English' });
		loadLanguages('English');
	} else {
		languageInput.value = data.language;
		loadLanguages(data.language);
	}

	loadLocales();
	if (data.locale === undefined) {
		chrome.storage.sync.set({ locale: 'en-US-Wavenet-A' });
	} else {
		localeInput.value = data.locale;
	}

	if (data.speed === undefined) {
		speedInput.value = 1;
		speedValue.innerHTML = 1;
		chrome.storage.sync.set({ speed: 1 });
	} else {
		speedInput.value = data.speed;
		speedValue.innerHTML = data.speed;
	}

	if (data.pitch === undefined) {
		pitchInput.value = 0;
		pitchValue.innerHTML = 0;
		chrome.storage.sync.set({ pitch: 0 });
	} else {
		pitchInput.value = data.pitch;
		pitchValue.innerHTML = data.pitch;
	}
});

// Settings from event listener
apiKeyInput.addEventListener('change', (event) => {
	chrome.storage.sync.set({
		apiKey: event.srcElement.value
	});
});

localeInput.addEventListener('change', (event) => {
	chrome.storage.sync.set({
		locale: event.srcElement.value
	});
})

languageInput.addEventListener('change', (event) => {
	chrome.storage.sync.set({
		language: event.srcElement.value
	});
	loadLocales();
	chrome.storage.sync.set({
		locale: localeInput.options[localeInput.selectedIndex].value
	})
});

speedInput.addEventListener('input', (event) => {
	speedValue.innerHTML = event.srcElement.value
});

speedInput.addEventListener('mouseup', (event) => {
	chrome.storage.sync.set({
		speed: event.srcElement.value
	});
});

pitchInput.addEventListener('input', (event) => {
	pitchValue.innerHTML = event.srcElement.value;
});

pitchInput.addEventListener('mouseup', (event) => {
	chrome.storage.sync.set({
		pitch: event.srcElement.value
	});
});
