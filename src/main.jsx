import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AgencyDashboard from './AgencyDashboard'
import PartnerDashboard from './PartnerDashboard'
import SellerMyPage from './SellerMyPage'
import PartnerLP from './PartnerLP'
import ToolHubPage from './ToolHubPage'
import DictionaryPage from './DictionaryPage'
import CostCalculatorPage from './CostCalculatorPage'
import MortgageSimulatorPage from './MortgageSimulatorPage'
import CommunityCreatePage from './CommunityCreatePage'
import CommunityListPage from './CommunityListPage'
import CommunitySuccessPage from './CommunitySuccessPage'
import ConsultationHubPage from './ConsultationHubPage'

function CommunityApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/community" element={<CommunityListPage />} />
        <Route path="/community/create" element={<CommunityCreatePage />} />
        <Route path="/community/success" element={<CommunitySuccessPage />} />
        <Route path="/consultation" element={<ConsultationHubPage />} />
        <Route path="*" element={<Navigate to="/community" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

const TOOL_URL_MAP = {
  dictionary: '/tools/dictionary',
  costs: '/tools/costs',
  mortgage: '/tools/mortgage',
};

function ToolHubStandalone() {
  return (
    <ToolHubPage
      onSelectTool={(id) => {
        const url = TOOL_URL_MAP[id];
        if (url) { window.location.href = url; } else { window.location.href = '/'; }
      }}
      onBack={() => { window.location.href = '/'; }}
    />
  );
}

function DictionaryStandalone() {
  return <DictionaryPage onBack={() => { window.location.href = '/tools'; }} />;
}

function CostCalculatorStandalone() {
  return (
    <CostCalculatorPage
      onBack={() => { window.location.href = '/tools'; }}
      onSelectTool={(id) => {
        const url = TOOL_URL_MAP[id];
        if (url) { window.location.href = url; } else { window.location.href = '/tools'; }
      }}
    />
  );
}

const pathname = window.location.pathname

let Component = App
if (pathname === '/admin' || pathname === '/admin/') {
  Component = AdminDashboard
} else if (pathname === '/agency' || pathname === '/agency/') {
  Component = AgencyDashboard
} else if (pathname === '/partner' || pathname === '/partner/') {
  Component = PartnerDashboard
} else if (pathname === '/seller' || pathname === '/seller/') {
  Component = SellerMyPage
} else if (pathname === '/partner-lp' || pathname === '/partner-lp/') {
  Component = PartnerLP
} else if (pathname === '/tools' || pathname === '/tools/') {
  Component = ToolHubStandalone
} else if (pathname === '/tools/dictionary' || pathname === '/tools/dictionary/') {
  Component = DictionaryStandalone
} else if (pathname === '/tools/costs' || pathname === '/tools/costs/') {
  Component = CostCalculatorStandalone
} else if (pathname === '/tools/mortgage' || pathname === '/tools/mortgage/') {
  Component = () => (
    <MortgageSimulatorPage
      onBack={() => { window.location.href = '/tools'; }}
      onOpenConcierge={() => {}}
    />
  )
} else if (pathname.startsWith('/community') || pathname.startsWith('/consultation')) {
  Component = CommunityApp
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Component />
  </StrictMode>,
)
// cache bust 2026年 4月29日 水曜日 19時04分58秒 JST
