import React, { useState } from 'react'
import {Loader} from "react-feather";
import {twMerge} from "tailwind-merge";

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
      className={twMerge(
        buttonColorMap[type],
        'flex transition-all items-center rounded-md py-1.5 px-2.5 select-none border text-xs font-medium shadow-sm w-full relative',
        (submitting || disabled) && 'opacity-50 cursor-not-allowed',
        scale,
        className
      )} {...args}
    >
      {Icon && !submitting && <Icon className="mr-1.5" size={16} />}
      {submitting && <Loader size={16} className="mr-1.5 animate-spin" />}
      <span className="flex items-center justify-center text-center w-full relative whitespace-nowrap">
        {children}
      </span>
      <span className={twMerge(
          'w-full h-full absolute top-0 left-0 bg-black rounded -z-50',
          buttonColorMap[type],
          ping && 'animate-ping-sm'
        )}>
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
