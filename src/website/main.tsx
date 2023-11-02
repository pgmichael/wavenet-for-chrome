import { createRoot } from 'react-dom/client'
import './main.css'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { ChangelogPage } from './pages/ChangelogPage'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ScrollToHash } from './components/ScrollToHash'
import { ScrollToTop } from './components/ScrollToTop'

export function Website() {
  return (
    <div className='flex flex-col items-center justify-center text-neutral-800'>
      <Header />
      <Routes>
        <Route path='/changelog' element={<ChangelogPage />} />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route path='/' element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Website />
      <ScrollToTop />
      <ScrollToHash />
    </BrowserRouter>
  </React.StrictMode>,
)
