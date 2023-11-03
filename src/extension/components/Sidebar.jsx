import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart,
  Box,
  CreditCard,
  GitHub,
  HelpCircle,
  Key,
  Settings,
  Star,
} from 'react-feather'
import { twMerge } from 'tailwind-merge'
import { useSync } from '../../hooks/useSync'

export function Sidebar() {
  const { sync, ready } = useSync()

  if (!ready) return null

  return (
    <div className="flex flex-col w-56 p-2 py-2.5 border-r">
      <div className="flex items-center text-center mb-3 mx-1 ml-3">
        <img
          src="../../public/images/icon_1000.png"
          className="mr-1.5 pt-0.5"
          style={{ width: '26px' }}
        />
        <div>
          <div className="text-base font-bold text-neutral-800 bg-">
            Wavenet
          </div>
          <div
            className="text-xs font-bold text-neutral-500"
            style={{ fontSize: '10px', marginTop: '-5px' }}
          >
            for Chrome
          </div>
        </div>
      </div>
      <Sidebar.Item
        Icon={sync.mode === 'paid' ? CreditCard : Key}
        color="bg-green-500"
        to="/billing"
      >
        {sync.mode === 'paid' ? 'Billing' : 'Credentials'}
      </Sidebar.Item>
      <Sidebar.Item
        Icon={BarChart}
        color="bg-sky-500"
        to="/usage"
        disabled={sync.mode === 'free' || !sync.user}
      >
        Usage
      </Sidebar.Item>
      <Sidebar.Item Icon={Settings} color="bg-indigo-500" to="/preferences">
        Preferences
      </Sidebar.Item>
      <Sidebar.Item
        Icon={Box}
        color="bg-purple-500"
        to="/sandbox"
        disabled={
          (sync.mode === 'free' && !sync.apiKeyValid) ||
          (sync.mode === 'paid' && !sync.user?.credits)
        }
      >
        Sandbox
      </Sidebar.Item>
      <div className="mt-auto">
        <Sidebar.Item
          Icon={HelpCircle}
          color="bg-neutral-400"
          to="https://wavenet-for-chrome.com/changelog"
        >
          Changelog
        </Sidebar.Item>
        <Sidebar.Item
          Icon={GitHub}
          color="bg-neutral-600"
          to="https://github.com/pgmichael/wavenet-for-chrome"
        >
          Contribute
        </Sidebar.Item>
        <Sidebar.Item
          Icon={Star}
          color="bg-yellow-500"
          to="https://chrome.google.com/webstore/detail/wavenet-for-chrome/iefankigbnlnlaolflbcopliocibkffc?hl=en"
        >
          Leave a review
        </Sidebar.Item>
      </div>
    </div>
  )
}

Sidebar.Item = function Item({ Icon, children, to, color, onClick, disabled }) {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === to

  function handleClick() {
    if (disabled) {
      return
    }

    if (to.startsWith('http')) {
      return chrome.tabs.create({ url: to })
    }

    navigate(to)
  }

  return (
    <button
      onClick={onClick || handleClick}
      className={twMerge(
        'p-1 flex items-center group font-semibold rounded cursor-pointer transition-all w-full',
        !active && 'text-neutral-700 hover:text-neutral-900',
        active && 'bg-neutral-200 bg-opacity-70 text-neutral-900',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <div className={`p-1 rounded mr-1.5 text-white ${color}`}>
        <Icon size={14} className="group-hover:animate-wiggle" />
      </div>
      <div>{children}</div>
    </button>
  )
}
