import React from 'react'

export function View({ children }) {
  return (
    <div className="p-4 w-full overflow-y-scroll bg-neutral-100 bg-opacity-60" style={{ height: '550px' }}>
      <div className="h-full">{children}</div>
    </div>
  )
}
