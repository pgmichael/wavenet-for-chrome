import React, { useState } from 'react'
import { useSession } from '../../hooks/useSession.js'
import { useSync } from '../../hooks/useSync.js'
import { Dropdown } from '../inputs/Dropdown.jsx'
import { Text } from '../inputs/Text.jsx'
import { classNames } from '../../helpers/class-names.js'
import { Button } from '../buttons/Button.jsx'
import { Key } from '../icons/Key.jsx'
import { Command } from '../icons/Command.jsx'

const speedOptions = [
  { title: '0.5', value: 0.5 },
  { title: '0.75', value: 0.75 },
  { title: '1', value: 1 },
  { title: '1.25', value: 1.25 },
  { title: '1.5', value: 1.5 },
  { title: '2', value: 2 },
  { title: '3', value: 3 },
]

const pitchOptions = [
  { title: 'Low', value: -5 },
  { title: 'Normal', value: 0 },
  { title: 'High', value: 5 },
]

const downloadAudioFormats = [
  { value: 'MP3_64_KBPS', title: 'MP3 (64kbps)', description: 'Recommended' },
  { value: 'MP3', title: 'MP3 (32kbps)' },
]

const readingAudioFormats = [
  { value: 'OGG_OPUS', title: 'OGG', description: 'Recommended' },
  { value: 'LINEAR16', title: 'WAV' },
  { value: 'MP3_64_KBPS', title: 'MP3 (64kbps)' },
  { value: 'MP3', title: 'MP3 (32kbps)' },
]

export function Preferences() {
  const { ready: sessionReady, session } = useSession()
  const { ready: syncReady, sync, setSync } = useSync()
  const [apiKeyValidating, setApiKeyValidating] = useState(false)
  const [apiKeyError, setApiKeyError] = useState('')

  if (!sessionReady || !syncReady) return null
  const languageOptions = getLanguageOptions(session)
  const voiceOptions = getVoiceOptions(session, sync.language)
  const voice = sync.voices[sync.language] || voiceOptions[0]?.value

  async function handleApiKeyValidation() {
    setApiKeyValidating(true)

    const voices = await chrome.runtime.sendMessage({
      id: 'fetchVoices',
      offscreen: false,
    })
    if (!voices) {
      setApiKeyError('Provided API key is invalid')
      setApiKeyValidating(false)
      return setSync({ ...sync, apiKeyValid: false })
    }

    setSync({ ...sync, apiKeyValid: true })
    setApiKeyValidating(false)
    setApiKeyError('')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Credentials
        </div>
        <div className="bg-white p-3 rounded shadow-sm border flex flex-col gap-2">
          <Text
            error={apiKeyError}
            label="API key"
            placeholder="Ex: ABzaSyDRIlE4ioDeZ03fya3385XeyUAvMorxWjw"
            value={sync.apiKey}
            onChange={(apiKey) =>
              setSync({ ...sync, apiKey, apiKeyValid: false })
            }
          />
          {!sync.apiKeyValid && (
            <div className="w-fit ml-auto">
              <Button
                type="primary"
                disabled={!sync.apiKey}
                Icon={Key}
                onClick={handleApiKeyValidation}
                submitting={apiKeyValidating}
              >
                Validate API key
              </Button>
            </div>
          )}
        </div>
      </div>
      <div
        className={classNames({
          'opacity-50 pointer-events-none': !sync.apiKeyValid,
        })}
      >
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Audio playback
        </div>
        <div className="grid gap-4 grid-cols-2 bg-white p-3 rounded shadow-sm border">
          <Dropdown
            label="Language"
            value={sync.language}
            onChange={(language) => {
              if (languageOptions.find((l) => l.value === language)) {
                setSync({ ...sync, language })
              }
            }}
            placeholder="Select language"
            options={languageOptions}
          />
          <Dropdown
            label="Voice"
            value={voice}
            onChange={(voice) => {
              if (voiceOptions.find((v) => v.value === voice)) {
                setSync({
                  ...sync,
                  voices: { ...sync.voices, [sync.language]: voice },
                })
              }
            }}
            placeholder="Select voice"
            options={voiceOptions}
          />
          <Dropdown
            label="Speed"
            onChange={(speed) => {
              if (speedOptions.find((s) => s.value === speed)) {
                setSync({ ...sync, speed })
              }
            }}
            value={sync.speed}
            options={speedOptions}
          />
          <Dropdown
            label="Pitch"
            onChange={(pitch) => {
              if (pitchOptions.find((p) => p.value === pitch)) {
                setSync({ ...sync, pitch })
              }
            }}
            value={sync.pitch}
            options={pitchOptions}
          />
        </div>
      </div>
      <div
        className={classNames({
          'opacity-50 pointer-events-none': !sync.apiKeyValid,
        })}
      >
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Audio format
        </div>
        <div className="grid gap-4 grid-cols-2 bg-white p-3 rounded shadow-sm border">
          <Dropdown
            label="When downloading"
            value={sync.downloadEncoding}
            options={downloadAudioFormats}
            onChange={(downloadEncoding) => {
              if (
                downloadAudioFormats.find((f) => f.value === downloadEncoding)
              ) {
                setSync({ ...sync, downloadEncoding })
              }
            }}
          />
          <Dropdown
            label="When reading aloud"
            value={sync.readAloudEncoding}
            options={readingAudioFormats}
            onChange={(readAloudEncoding) => {
              if (
                readingAudioFormats.find((f) => f.value === readAloudEncoding)
              ) {
                setSync({ ...sync, readAloudEncoding })
              }
            }}
          />
        </div>
      </div>
        <div
          className={classNames({
            'opacity-50 pointer-events-none': !sync.apiKeyValid,
          })}
        >
          <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
            Shortcuts
          </div>
          <div className="grid gap-4 grid-cols-2 bg-white p-3 rounded shadow-sm border">
            <Button
              type="primary"
              Icon={Command}
              onClick={() =>
                chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
              }
            >
              Edit shortcuts
            </Button>
          </div>
        </div>
    </div>
  )
}

function getVoiceOptions(session, language) {
  if (!session?.voices) return []
  const voicesInLanguage = session.voices.filter((voice) =>
    voice.languageCodes.includes(language)
  )
  const voiceNames = voicesInLanguage.map(({ name: value, ssmlGender }) => {
    const title = value.split('-').slice(2).join(' ')
    const description =
      ssmlGender.toLowerCase().at(0).toUpperCase() +
      ssmlGender.toLowerCase().slice(1)

    return { value, title, description }
  })

  const sortedVoices = voiceNames.sort()

  return sortedVoices
}

function getLanguageOptions(session) {
  if (!session?.languages) return []
  const displayNames = new Intl.DisplayNames(['en-US'], {
    type: 'language',
    languageDisplay: 'standard',
  })

  const languageNames = session.languages.map((value) => {
    const displayName = displayNames.of(value)
    if (!displayName) throw new Error(`No display name for ${value}`)

    let [title, ...tail] = displayName.split(' ')
    title += ` (${value.split('-')[1]})`
    let description = tail.join(' ')
    if (description.startsWith('(')) description = description.slice(1, -1)
    if (description.endsWith(')')) description = description.slice(0, -1)

    return { value, title, description }
  })

  const sortedLanguages = Array.from(languageNames).sort((a, b) => {
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  })

  return sortedLanguages
}
