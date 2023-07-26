import React, { useState } from 'react'
import { classNames } from '../../helpers/class-names.js'
import { Loader } from '../icons/Loader.jsx'

export function Button({
  children,
  submitting,
  Icon,
  type = 'default',
  className,
  disabled,
  ping,
  ...args
} = {}) {
  const [scale, setScale] = useState('scale-100')
  const scaleUp = () => {
    setScale('scale-90')
    setTimeout(() => setScale('scale-100'), 100)
  }

  return (
    <button
      onMouseDown={scaleUp}
      disabled={submitting || disabled}
      className={classNames({
        [buttonColorMap[type]]: true,
        'flex transition-all items-center rounded-md py-1.5 px-2.5 select-none border text-xs font-medium shadow-sm w-full relative': true,
        'opacity-50 cursor-not-allowed': submitting || disabled,
        [scale]: true,
        [className]: className
      })}
      {...args}
    >
      {Icon && !submitting && <Icon className="mr-1.5" size={16} />}
      {submitting && <Loader size={16} className="mr-1.5 animate-spin" />}
      <span className="flex items-center justify-center text-center w-full relative whitespace-nowrap">
        {children}
      </span>
      <span className={classNames({
        'w-full h-full absolute top-0 left-0 bg-black rounded -z-50': true,
        [buttonColorMap[type]]: true,
        'animate-ping-sm': ping
      })}>
      </span>
    </button>
  )
}

const buttonColorMap = {
  default: 'bg-white hover:bg-neutral-100 text-neutral-600',
  primary: 'bg-blue-600 text-white border-blue-900 border-opacity-25 hover:bg-blue-700',
  secondary: 'bg-neutral-100 hover:bg-neutral-200',
  danger: 'bg-red-600 text-white border-red-900 border-opacity-25 hover:bg-red-700',
  success: 'bg-green-600 text-white border-green-900 border-opacity-25 hover:bg-green-700',
  warning: 'bg-amber-600 text-white border-amber-900 border-opacity-25 hover:bg-amber-700'
}
