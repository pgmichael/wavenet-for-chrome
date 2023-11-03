import React from 'react'
import { useState } from 'react'
import { CreditCard, Key } from 'react-feather'
import { Text } from '../../../components/inputs/Text.jsx'
import { Button } from '../../../components/Button.js'
import { useSync } from '../../../hooks/useSync.js'

export function ApiKeyForm() {}

ApiKeyForm.Content = function ({ form, sync, setSync }) {
  return (
    <Text
      error={form.error}
      label="API key"
      placeholder="Ex: ABzaSyDRIlE4ioDeZ03fya3385XeyUAvMorxWjw"
      value={sync.apiKey}
      onChange={(apiKey) => setSync({ ...sync, apiKey, apiKeyValid: false })}
    />
  )
}

ApiKeyForm.Buttons = function ({ form, sync, setSync }) {
  return (
    <div className="flex">
      <Button
        Icon={CreditCard}
        onClick={() => setSync({ ...sync, mode: 'paid' })}
      >
        {sync.user?.credits > 0
          ? 'Use credits instead'
          : 'Purchase credits instead'}
      </Button>
      <Button
        className="ml-2"
        type="primary"
        Icon={Key}
        onClick={form.validate}
        submitting={form.validating}
      >
        Save API key
      </Button>
    </div>
  )
}

ApiKeyForm.Validator = function (callback) {
  const { sync, setSync } = useSync()
  const [error, setError] = useState(null)
  const [validating, setValidating] = useState(false)

  async function validate() {
    setValidating(true)

    if (!(await chrome.runtime.sendMessage({ id: 'validateApiKey' }))) {
      setError('Provided API key is invalid')
      setValidating(false)
      return setSync({ ...sync, apiKeyValid: false })
    }

    await setSync({ ...sync, apiKeyValid: true })
    setValidating(false)
    setError('')
    callback()
  }

  return { error, validating, validate }
}
