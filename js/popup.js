// Retreive settings upon popup opening.
chrome.storage.sync.get(null, (data) => {
	if (data.apiKey !== undefined) {
		document.querySelector('#apiKey').value = data.apiKey;
	}

	if (data.voice === undefined) {
		chrome.storage.sync.set({
			voice: document.querySelector('#voice').value
		});
	} else {
		document.querySelector('#voice').value = data.voice;
	}

	if (data.speed === undefined) {
		chrome.storage.sync.set({
			speed: document.querySelector('#speed').value
		});
	} else {
		document.querySelector('#speed').value = data.speed;
		document.querySelector('#speedValue').innerHTML = data.speed;
	}

	if (data.pitch === undefined) {
		chrome.storage.sync.set({
			pitch: document.querySelector('#pitch').value
		});
	} else {
		document.querySelector('#pitch').value = data.pitch;
		document.querySelector('#pitchValue').innerHTML = data.pitch;
	}
});

// EVENT LISTENERS
document.querySelector('#apiKey').addEventListener('input', (event) => {
	chrome.storage.sync.set({
		apiKey: event.srcElement.value
	});
});

document.querySelector('#voice').addEventListener('input', (event) => {
	chrome.storage.sync.set({
		voice: event.srcElement.value
	});
});

const speedSlider = document.querySelector('#speed');
speedSlider.addEventListener('input', (event) => {
	document.querySelector('#speedValue').innerHTML = event.srcElement.value;
});

speedSlider.addEventListener('mouseup', (event) => {
	chrome.storage.sync.set({
		speed: event.srcElement.value
	});
});

const pitchSlider = document.querySelector('#pitch');
pitchSlider.addEventListener('input', (event) => {
	document.querySelector('#pitchValue').innerHTML = event.srcElement.value;
});

pitchSlider.addEventListener('mouseup', (event) => {
	chrome.storage.sync.set({
		pitch: event.srcElement.value
	});
});
