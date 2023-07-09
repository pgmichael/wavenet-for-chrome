import React from 'react'

export function Play({ size, ...args }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...args}
    >
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  )
}
