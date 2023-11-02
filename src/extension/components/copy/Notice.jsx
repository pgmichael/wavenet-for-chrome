import React from "react";
import { isError } from "../../helpers/error-helpers";
import { useStore } from "../../../hooks/useStore";
import { errorStore } from "../../extension";

export const Notice = () => {
  const [error, setError] = useStore(errorStore, {rerenderOnEffect: false})

  async function handleAuthentication() {
    const response = await chrome.runtime.sendMessage({id: 'authenticate'})

    if (isError(response)) setError(response)
  }

  return <div className='flex flex-col gap-3'>
    <p>
      Wavenet for Chrome is a <a className='text-blue-700 font-semibold underline'
                                 href='https://www.github.com/pgmichael/wavenet-for-chrome' target="_blank">free
      open source extension</a>, but requires a Google Cloud API key to
      function.
    </p>
    <p>
      You can either use your own API key which requires some technical knowledge, or you can purchase credits
      directly for ease of use and to support the project.
    </p>
    <p>
      If you have already purchased credits, but are seeing this message click here to <span className='cursor-pointer text-blue-700 font-semibold underline' onClick={handleAuthentication}>re-sync your account</span>.
    </p>
  </div>
}

export const FreeNotice = () => (
  <div className='flex flex-col gap-1 mb-6'>
    <p>
      Enter your Google Cloud API key to use Wavenet for Chrome. You can get a retrieve an API key by following the instructions <a
      className='text-blue-700 font-semibold underline' href='https://www.youtube.com/watch?v=1n8xlVNWEZ0'>here</a>.
    </p>
  </div>
)