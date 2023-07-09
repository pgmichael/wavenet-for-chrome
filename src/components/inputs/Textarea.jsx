import React, { useState } from 'react'
import { classNames } from '../../helpers/class-names.js'

export function Textarea(props) {
  const [value, setValue] = useState(props.value)

  function handleChange(e) {
    const value = e?.currentTarget?.value
    setValue(value)
    if (props.onChange) props.onChange(value)
  }

  return (
    <div className={classNames({
      'relative font-semibold text-xs flex flex-col grow': true,
      [props.className]: props.className
    })}>
      <label className={classNames({
        'bg-white absolute text-xxs -top-2 left-1.5 px-1 text-neutral-500': true,
        'text-red-500': props.error
      })}>
        {props.label}
      </label>

      <textarea
        className={classNames({
          'border border-neutral-200 px-3 py-1 pt-2.5 outline-none rounded-md w-full text-neutral-900 grow': true,
          'border-red-400': props.error
        })}
        placeholder={props.placeholder}
        value={props.value}
        onChange={handleChange}
        disabled={props.disabled}
      />

      <span className="text-red-500 text-xxs pl-2 pt-0.5">{props.error}</span>
    </div>
  )
}
