import React from "react"
import { MapPin } from "react-feather"
import { Link } from "react-router-dom"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <div className='w-full flex flex-col items-center mt-8 border-t border-neutral-200'>
      <div className='flex justify-center items-center w-full max-w-screen-xl overflow-hidden p-4'>
        <div className='flex flex-col gap-1'>
          <div className='text-xs whitespace-nowrap'>© {year} <a href="https://www.pgmichael.com" className='hover:underline'>Michael Poirier-Ginter</a></div>
          <div className='text-xs flex items-center whitespace-nowrap'>{<MapPin size={11} className='mr-1' />} Made in Quebec City, Canada</div>
        </div>
        <div className='flex items-center w-full max-w-screen-xl p-4'>
          <div className='flex flex-col md:flex-row ml-auto text-sm gap-1'>
            <Link to='/privacy-policy' className='p-2 hover:bg-neutral-200 bg-opacity-60 rounded'>
              Privacy Policy
            </Link>
            <Link to='/#features' className='p-2 hover:bg-neutral-200 bg-opacity-60 rounded'>
              Features
            </Link>
            <Link to='/changelog' className='p-2 hover:bg-neutral-200 bg-opacity-60 rounded'>
              Changelog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
