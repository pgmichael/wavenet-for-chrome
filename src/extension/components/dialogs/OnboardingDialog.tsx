import { CreditCard, Key } from 'react-feather'
import { Dialog } from '../../../components/Dialog.js'
import * as React from 'react'
import { FreeNotice, Notice } from '../copy/Notice.jsx'
import { PricingTable } from '../copy/PricingTable.jsx'
import { ApiKeyForm } from '../forms/ApiKey.js'
import { Button } from '../../../components/Button.js'
import { useSync } from '../../../hooks/useSync.js'
import { useSession } from '../../../hooks/useSession.js'
import { useStore } from '../../../hooks/useStore.js'
import { errorStore } from '../../extension.js'

export function OnboardingDialog({ onClose }) {
  const { sync, setSync, ready: syncReady } = useSync()
  const { session, ready: sessionReady } = useSession()
  const form = ApiKeyForm.Validator(onClose)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = useStore(errorStore)

  async function pay() {
    setLoading(true)
    const paymentSession = await chrome.runtime.sendMessage({
      id: 'createPaymentSession',
    })
    setLoading(false)

    if (isError(paymentSession)) {
      setError(paymentSession)
      return
    }

    if (!paymentSession?.hosted_invoice_url) {
      throw new Error(
        'Could not create payment session or payment session URL is missing',
      )
    }

    window.open(paymentSession.hosted_invoice_url)
  }

  function useMyOwnApiKey() {
    if (sync.apiKey && sync.apiKeyValid) {
      onClose()
    }

    setSync({ ...sync, mode: 'free' })
  }

  function renderContent() {
    if (sync.mode === 'paid') {
      if (sync.user?.credits) {
        onClose()
      }

      return (
        <div>
          <Notice />
          <br />
          <PricingTable />
        </div>
      )
    }

    return (
      <React.Fragment>
        <FreeNotice />
        <ApiKeyForm.Content form={form} sync={sync} setSync={setSync} />
      </React.Fragment>
    )
  }

  function renderButtons() {
    if (sync.mode === 'free') {
      return <ApiKeyForm.Buttons form={form} sync={sync} setSync={setSync} />
    }

    return [
      <Button
        className="max-w-fit"
        key="mode-switch-button"
        Icon={Key}
        onClick={useMyOwnApiKey}
        submitting={loading}
      >
        Use my own API key
      </Button>,
      <Button
        className="max-w-fit"
        type="primary"
        key="paymnet-button"
        Icon={CreditCard}
        onClick={pay}
        submitting={loading}
        ping={session.paymentSession}
      >
        {session.paymentSession
          ? 'Waiting for payment'
          : 'Purchase credits ($9.75)'}
      </Button>,
    ]
  }

  if (!syncReady || !sessionReady) {
    return null
  }

  return (
    <Dialog
      title={
        sync.mode === 'paid'
          ? "You're almost there!"
          : 'Your API key is missing or invalid'
      }
      content={renderContent()}
      onClose={onClose}
      buttons={renderButtons()}
    />
  )
}
