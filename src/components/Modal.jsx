import * as React from 'react'
import { useOutsideClick } from '../hooks/useOutsideClick.js'
import { Download } from './icons/Download.jsx'
import { Button } from './buttons/Button.jsx'
import { Key } from './icons/Key.jsx'

export function Modal({
  title,
  Icon,
  content,
  onClose,
  onContinue,
  buttons,
  ...args
} = {}) {
  return (
    <div
      style={{ zIndex: Number.MAX_SAFE_INTEGER }}
      className="fixed flex w-full h-screen justify-center items-center left-0 top-0 bg-black bg-opacity-10"
      {...args}
    >
      <div
        ref={useOutsideClick(onClose)}
        className="bg-white h-fit rounded-lg overflow-hidden shadow-2xl max-w-lg animate-popup"
      >
        <div className="flex p-5 pr-6">
          <div className="bg-red-100 h-fit p-2 rounded-full flex justify-center items-center mr-4">
            <Icon size={24} className="text-red-800" />
          </div>
          <div>
            <h1 className="text-lg mb-1 tracking-wide text-neutral-800 font-semibold">
              {title}
            </h1>
            <div className="text-sm text-neutral-600 break-words">{content}</div>
          </div>
          <div>
            <audio></audio>
          </div>
        </div>
        {buttons && (
          <div className="flex justify-end gap-2 bg-neutral-100 p-3 pr-5 border-t border-neutral-100 border-t-1">
            {buttons}
          </div>
        )}
      </div>
    </div>
  )
}
