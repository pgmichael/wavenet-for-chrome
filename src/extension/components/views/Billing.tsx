import React, { useEffect } from 'react'
import { CreditCard, DollarSign, Key } from 'react-feather'
import { Notice } from '../copy/Notice.jsx'
import { PricingTable } from '../copy/PricingTable.jsx'
import { ApiKeyForm } from '../forms/ApiKey.js'
import { useNavigate } from 'react-router-dom'
import { dateFormat, creditFormat } from '../../helpers/formatting-helpers.js'
import { Button } from '../../../components/Button.js'
import { useSession } from '../../../hooks/useSession.js'
import { useSync } from '../../../hooks/useSync.js'
import { useStore } from '../../../hooks/useStore.js'
import { errorStore } from '../../extension.js'
import { isError } from '../../helpers/error-helpers.js'

export function Billing() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const { session, ready: sessionReady } = useSession()
  const { sync, setSync, ready: syncReady } = useSync()
  const form = ApiKeyForm.Validator(() => navigate('/preferences'))
  const [error, setError] = useStore(errorStore)
  const paymentSession = session?.paymentSession

  useEffect(() => {
    chrome.runtime.sendMessage({ id: 'fetchInvoices' }, (response) => {
      if (!response) return

      setInvoices(response)
    })
  }, [sync.user])

  async function pay() {
    setLoading(true)
    const paymentSession = await chrome.runtime.sendMessage({id: 'createPaymentSession'})
    setLoading(false)

    if (isError(paymentSession)) {
      setError(paymentSession)
      return
    }
    
    if (!paymentSession?.hosted_invoice_url) {
      throw new Error('Could not create payment session or payment session URL is missing')
    }

    window.open(paymentSession.hosted_invoice_url)
  }

  if (!sessionReady || !syncReady) return

  function renderCredentials() {
    if (sync.mode === 'paid') return null

    return (
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Credentials
        </div>
        <div className="bg-white p-3 rounded shadow-sm border flex flex-col gap-2">
          <ApiKeyForm.Content form={form} sync={sync} setSync={setSync} />
          <ApiKeyForm.Buttons form={form} sync={sync} setSync={setSync} />
        </div>
      </div>
    )
  }

  function renderPaymentMethods() {
    if (sync.mode !== 'paid') return null

    return (
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Payment method
        </div>
        {!sync.user?.credits && (
          <div className="bg-white p-3 rounded shadow-sm border flex flex-col">
            <Notice />
            <br />
            <PricingTable />
            <div className="flex mt-3">
              <Button
                className="max-w-fit"
                key="close"
                Icon={Key}
                onClick={() => setSync({ ...sync, mode: 'free' })}
              >
                Use API key
              </Button>
              <Button
                className="w-full ml-2"
                type="primary"
                key="support"
                Icon={CreditCard}
                onClick={pay}
                submitting={loading}
                ping={paymentSession}
              >
                {paymentSession
                  ? 'Waiting for payment'
                  : 'Purchase credits ($9.75)'}
              </Button>
            </div>
          </div>
        )}

        {sync.user?.credits > 0 && (
          <div className="bg-white p-3 rounded shadow-sm border flex flex-col gap-2">
            <p>
              Please contact{' '}
              <a
                className="text-blue-700 font-semibold underline"
                href="mailto:michael.poirierginter@gmail.com"
              >
                michael.poirierginter@gmail.com
              </a>{' '}
              if you wish to change your payment method or if you have any
              questions.
            </p>
            <div className='flex gap-2'>
              <Button
                className="w-full"
                onClick={async () => {
                  setSync({ ...sync, mode: 'free', user: null })
                }}
              >
                Logout
              </Button>
              <Button
                className="w-full"
                onClick={() => setSync({ ...sync, mode: 'free' })}
              >
                Use my own API key instead
              </Button>
            </div>
          </div>
        )
        }
      </div >
    )
  }

  function renderInvoices() {
    if (sync.mode === 'free') return null
    if (!invoices.length) return null

    return (
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Invoices
        </div>
        <div className="bg-white rounded shadow-sm border flex flex-col">
          {invoices.map((invoice) => (
            <Invoice {...invoice} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {renderCredentials()}
      {renderPaymentMethods()}
      {renderInvoices()}
    </div>
  )
}

function Invoice(props) {
  return (
    <div className="flex justify-center items-center p-3 even:bg-neutral-50">
      <div className="bg-green-200 text-green-800 rounded mr-2">
        <DollarSign className="m-1.5" size={16} />
      </div>
      <div className="font-semibold text-neutral-700">
        {dateFormat(props.inserted_at)}
      </div>

      <Button
        className="ml-auto w-fit"
        onClick={() => chrome.tabs.create({ url: props.hosted_invoice_url })}
      >
        View receipt ({creditFormat(props.amount, 100)})
      </Button>
    </div>
  )
}
