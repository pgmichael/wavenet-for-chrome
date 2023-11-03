import React from 'react'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'

export function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      <Hero />
      <Features />
    </div>
  )
}
