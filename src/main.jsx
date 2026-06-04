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
import PropertySearchListPage from './PropertySearchListPage'
import ExperienceStartScreen from './ExperienceStartScreen'
import ExperienceInterview from './ExperienceInterview'
import ExperienceAnalyzing from './ExperienceAnalyzing'
import ExperienceResult from './ExperienceResult'
import ExperienceComplete from './ExperienceComplete'
import ExperienceFeed from './ExperienceFeed'
import ExperiencePost from './ExperiencePost'
import BottomNav from './BottomNav'
import ProTopPage from './ProTopPage'
import ProInvestigationPage from './ProInvestigationPage'
import ProDocsPage from './ProDocsPage'
import WorkspacePage from './WorkspacePage'
import HouseRecordPage from './HouseRecordPage'
import HousesListPage from './HousesListPage'
import ClientsListPage from './ClientsListPage'

function ExperienceApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/experiences" element={<ExperienceStartScreen />} />
        <Route path="/experiences/interview" element={<ExperienceInterview />} />
        <Route path="/experiences/analyzing" element={<ExperienceAnalyzing />} />
        <Route path="/experiences/result" element={<ExperienceResult />} />
        <Route path="/experiences/complete" element={<ExperienceComplete />} />
        <Route path="/experiences/feed" element={<ExperienceFeed />} />
        <Route path="/experiences/post/:id" element={<ExperiencePost />} />
        <Route path="*" element={<Navigate to="/experiences" replace />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}

function CommunityApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/community" element={<CommunityListPage />} />
        <Route path="/community/create" element={<CommunityCreatePage />} />
        <Route path="/community/success" element={<CommunitySuccessPage />} />
        <Route path="/consultation" element={<ConsultationHubPage />} />
        <Route path="/search" element={<PropertySearchListPage />} />
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
} else if (pathname.startsWith('/community') || pathname.startsWith('/consultation') || pathname.startsWith('/search')) {
  Component = CommunityApp
} else if (pathname === '/pro' || pathname === '/pro/') {
  Component = () => <ProTopPage onStart={() => { window.location.href = '/pro/investigation' }} onLogin={() => {}} />
} else if (pathname === '/pro/investigation' || pathname === '/pro/investigation/') {
  Component = ProInvestigationPage
} else if (pathname === '/pro/docs' || pathname === '/pro/docs/') {
  Component = ProDocsPage
} else if (pathname === '/workspace' || pathname === '/workspace/') {
  Component = WorkspacePage
} else if (pathname === '/houses' || pathname === '/houses/') {
  Component = HousesListPage
} else if (pathname === '/clients' || pathname === '/clients/') {
  Component = ClientsListPage
} else if (pathname.startsWith('/house/')) {
  Component = HouseRecordPage
} else if (pathname.startsWith('/experiences')) {
  Component = ExperienceApp
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Component />
  </StrictMode>,
)
// cache bust 2026年 4月29日 水曜日 19時04分58秒 JST
