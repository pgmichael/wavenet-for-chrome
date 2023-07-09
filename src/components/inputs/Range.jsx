import React, { useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce.js'

export function Range(props) {
  const [value, setValue] = React.useState(props.value || 0)
  const debouncedValue = useDebounce(value, 500)
  useEffect(() => { props.onChange(debouncedValue) }, [debouncedValue])

  return (
    <div className="relative font-semibold text-xs text-neutral-500">
      <label className='bg-white absolute text-xxs -top-2 left-1.5 px-1'>{props.label}</label>
      <div className="bg-white absolute text-xxs -top-2 right-1.5 px-1">
        {value.toString()}×
      </div>
      <div
        className='border border-neutral-200 h-9 px-3 py-1 outline-none rounded-md w-full text-neutral-900 flex items-center justify-center'>
        <input className="w-full h-0.5 bg-neutral-200 appearance-none rounded"
               type="range"
               name="price"
               min={props.min || 0}
               max={props.max || 100}
               step={props.step || 1}
               value={value}
               onChange={e => setValue(Number(e.currentTarget.value))}/>
      </div>
    </div>
  )
}
