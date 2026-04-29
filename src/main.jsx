import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AgencyDashboard from './AgencyDashboard'
import PartnerDashboard from './PartnerDashboard'

const pathname = window.location.pathname

let Component = App
if (pathname === '/admin' || pathname === '/admin/') {
  Component = AdminDashboard
} else if (pathname === '/agency' || pathname === '/agency/') {
  Component = AgencyDashboard
} else if (pathname === '/partner' || pathname === '/partner/') {
  Component = PartnerDashboard
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Component />
  </StrictMode>,
)
// cache bust 2026年 4月29日 水曜日 19時04分58秒 JST
