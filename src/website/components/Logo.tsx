import React from 'react'

export function Logo() {
  return (
    <div className="flex items-center text-center">
      <img
        src={new URL('../assets/icons/wavenet-for-chrome.png', import.meta.url).toString()}
        className="mr-3 pt-0.5 w-10"
      />
      <div>
        <div className="text-2xl font-bold text-neutral-800 bg-">
          Wavenet
        </div>
        <div
          className="text-sm font-bold text-neutral-500 opacity-80"
          style={{ fontSize: '10px', marginTop: '-5px' }}
        >
          for Chrome
        </div>
      </div>
    </div>
  )
}
