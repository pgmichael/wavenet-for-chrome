import { getExtensionInformation } from "../helpers"
import BCP47Languages from "../languages"
import { initSentry } from "../sentry"

initSentry(await getExtensionInformation())

const languages = {} as { [language: string]: string[] }

let languageInput: HTMLInputElement = document.querySelector('.settings__language')
let localeInput: HTMLSelectElement = document.querySelector('.settings__locale')
let speedInput: HTMLInputElement = document.querySelector('.settings__speed')
let pitchInput: HTMLInputElement = document.querySelector('.settings__pitch')
let apiKeyInput: HTMLInputElement = document.querySelector('.settings__api-key')
let pitchValue = document.querySelector('.settings__range-value--pitch')
let speedValue = document.querySelector('.settings__range-value--speed')

function loadLanguages(selectedLanguage) {
  languageInput.innerHTML = ``

  for (const key of Object.keys(languages))
    languageInput.innerHTML += `<option value="${key}">${key}</option>`

  let selectedOption: HTMLOptionElement = document.querySelector(
    `.settings__language option[value="${selectedLanguage}"]`
  )

  selectedOption.selected = true
}

function loadLocales() {
  localeInput.innerHTML = ``
  languages[languageInput.value].forEach(voice => {
    localeInput.innerHTML += `<option value="${voice}">${voice}</option>`
  })
  localeInput.options[0].selected = true
}

function setup() {
  chrome.storage.sync.get(null, async (data) => {
    if (data.speed === undefined) {
      speedInput.value = '1'
      speedValue.innerHTML = '1'
      chrome.storage.sync.set({ speed: 1 })
    } else {
      speedInput.value = data.speed
      speedValue.innerHTML = data.speed
    }

    if (data.pitch === undefined) {
      pitchInput.value = '1'
      pitchValue.innerHTML = '1'
      chrome.storage.sync.set({ pitch: 0 })
    } else {
      pitchInput.value = data.pitch
      pitchValue.innerHTML = data.pitch
    }

    if (data.apiKey === undefined || data.apiKey === "") {
      chrome.storage.sync.set({ apiKey: "" })
      return
    }

    apiKeyInput.value = data.apiKey
    const response = await fetch(`https://texttospeech.googleapis.com/v1beta1/voices?key=${data.apiKey}`)

    if (!response.ok) alert('There was an error fetching the list of voices. Make sure your API key is valid.')

    const responseJson = await response.json()

    for (const voice of responseJson.voices) {
      let languageCode = voice.languageCodes[0].split('-')[0]
      if (!voice.name.includes('Wavenet')) continue

      try {
        let language: string = BCP47Languages[languageCode].displayName
        !(language in languages) && (languages[language] = [])
        languages[language].push(voice.name)
      } catch (e) {
        console.error(`Language with code ${languageCode} is unsuported.`, e)
      }
    }

    if (data.language === undefined) {
      chrome.storage.sync.set({ language: 'English' })
      loadLanguages('English')
    } else {
      languageInput.value = data.language
      loadLanguages(data.language)
    }

    loadLocales()
    if (data.locale === undefined) {
      chrome.storage.sync.set({ locale: 'en-US-Wavenet-A' })
    } else {
      localeInput.value = data.locale
    }
  })
}

setup()

// Settings from event listener
apiKeyInput.addEventListener('change', (event) => {
  let target = (event.currentTarget as HTMLInputElement).value
  chrome.storage.sync.set({
    apiKey: target
  })

  setup()
})

localeInput.addEventListener('change', (event) => {
  let target = (event.currentTarget as HTMLInputElement).value
  chrome.storage.sync.set({
    locale: target
  })
})

languageInput.addEventListener('change', (event) => {
  let target = (event.currentTarget as HTMLInputElement).value
  chrome.storage.sync.set({
    language: target
  })
  loadLocales()
  chrome.storage.sync.set({
    locale: localeInput.options[localeInput.selectedIndex].value
  })
})

speedInput.addEventListener('input', (event) => {
  let target = (event.currentTarget as HTMLInputElement).value
  speedValue.innerHTML = target
})

speedInput.addEventListener('mouseup', (event) => {
  let target = (event.currentTarget as HTMLInputElement).value
  chrome.storage.sync.set({
    speed: target
  })
})

pitchInput.addEventListener('input', (event) => {
  let target = (event.currentTarget as HTMLInputElement).value
  pitchValue.innerHTML = target
})

pitchInput.addEventListener('mouseup', (event) => {
  let target = (event.currentTarget as HTMLInputElement).value
  chrome.storage.sync.set({
    pitch: target
  })
})