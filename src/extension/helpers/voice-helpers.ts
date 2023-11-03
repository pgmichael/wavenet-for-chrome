export function getVoiceOptions(session, language) {
  if (!session?.voices) return []

  const voicesInLanguage = session.voices.filter((voice) =>
    voice.languageCodes.includes(language),
  )

  const uniqueVoiceNames = new Set()

  const voiceNames = voicesInLanguage
    .map(({ name: value, ssmlGender }) => {
      const title = value.split('-').slice(2).join(' ')
      const description =
        ssmlGender.charAt(0).toUpperCase() + ssmlGender.toLowerCase().slice(1)
      return { value, title, description }
    })
    .filter(({ value }) => {
      if (uniqueVoiceNames.has(value)) {
        return false
      }

      uniqueVoiceNames.add(value)
      return true
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  return voiceNames
}

export function getLanguageOptions(session) {
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

  const sortedLanguages = Array.from(languageNames).sort((a: any, b: any) => {
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  })

  return sortedLanguages
}

export function getCurrentVoice(session, sync) {
  const languageOptions = getLanguageOptions(session)
  const voiceOptions = getVoiceOptions(session, sync.language)

  return sync.voices[sync.language] || voiceOptions[0]?.value
}
