import * as React from 'react'
import { useMount } from '../hooks/hooks/useMount'
import { useOutsideClick } from '../hooks/hooks/useOutsideClick'

type DialogProps = {
  title: string
  content: string
  onClose: () => void
  buttons?: React.ReactNode
}

export function Dialog({ title, content, onClose, buttons, ...args }: DialogProps) {
  useMount(() => document.getSelection().removeAllRanges())

  return (
    <div
      style={{ zIndex: Number.MAX_SAFE_INTEGER }}
      className="fixed flex w-full h-screen justify-center items-center left-0 top-0 bg-white bg-opacity-10 backdrop-blur-sm"
      {...args}
    >
      <div
        style={{ width: 500, maxWidth: '90vw' }}
        ref={useOutsideClick(onClose)}
        className="border bg-white h-fit rounded-lg overflow-hidden shadow-2xl animate-popup"
      >
        <div className="flex px-6 pt-4 pb-0">
          <div className='w-full'>
            <h1 className="text-lg mb-3 tracking-wide text-neutral-800 font-semibold">
              {title}
            </h1>
            <div className="text-sm text-neutral-600 break-words">{content}</div>
          </div>
          <div>
            <audio></audio>
          </div>
        </div>
        {buttons && (
          <div className="flex justify-end gap-3 p-6 pt-4">
            {buttons}
          </div>
        )}
      </div>
    </div>
  )
}
