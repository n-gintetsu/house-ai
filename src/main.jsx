import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { supabase } from './supabaseClient'
import { ADMIN_EMAIL } from './adminEmail'
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
import WorkspaceLoginPage from './WorkspaceLoginPage'
import WorkspaceSignupPage from './WorkspaceSignupPage'
import WorkspaceAuthGuard from './WorkspaceAuthGuard'
import LegalPage from './LegalPage'
import WorkspaceLegalPage from './WorkspaceLegalPage'
import MeetingPage from './MeetingPage'

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

// ── DevGuard ─────────────────────────────────────────────────
// 本体ルート(HONTAI_PUBLIC=false)をラップ。
// Supabase セッションの email が ADMIN_EMAIL と一致する場合のみ children を描画。
// 確認中は null（本体を一瞬も描画しない）。非管理者/未ログインは /login へ。
function DevGuard({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setStatus(
        session && session.user && session.user.email === ADMIN_EMAIL ? 'ok' : 'deny'
      )
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setStatus(
        session && session.user && session.user.email === ADMIN_EMAIL ? 'ok' : 'deny'
      )
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  if (status === 'checking') return null
  if (status === 'deny') { window.location.replace('/login'); return null }
  return children
}
// ─────────────────────────────────────────────────────────────

// ── 本体公開フラグ ──────────────────────────────────────────
// false = Workspace専用公開モード（本体ルートは管理者のみプレビュー可）
// true  = 本体も公開（本体リリース時にここだけ変える）
const HONTAI_PUBLIC = false
// ────────────────────────────────────────────────────────────

const pathname = window.location.pathname

// Workspace系 + 認証系は常に通す
const _WS_ALLOW = ['/login', '/signup', '/workspace', '/houses', '/clients', '/ws-legal', '/admin']
const _isWsPath =
  _WS_ALLOW.some(p => pathname === p || pathname === p + '/') ||
  pathname.startsWith('/house/') ||
  pathname.startsWith('/meeting/') ||
  pathname.startsWith('/auth/')

// 認証コールバック（本体ルートに着地した access_token/recovery）→ /workspace へ転送（変更なし）
if (!HONTAI_PUBLIC && !_isWsPath && (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery'))) {
  window.location.replace('/workspace' + window.location.search + window.location.hash)
} else {
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
  } else if (pathname === '/login' || pathname === '/login/') {
    Component = WorkspaceLoginPage
  } else if (pathname === '/signup' || pathname === '/signup/') {
    Component = WorkspaceSignupPage
  } else if (pathname === '/legal' || pathname === '/legal/') {
    Component = () => <LegalPage onNavigate={() => { window.location.href = '/' }} />
  } else if (pathname === '/ws-legal' || pathname === '/ws-legal/') {
    Component = WorkspaceLegalPage
  } else if (pathname === '/workspace' || pathname === '/workspace/') {
    Component = () => <WorkspaceAuthGuard><WorkspacePage /></WorkspaceAuthGuard>
  } else if (pathname === '/houses' || pathname === '/houses/') {
    Component = () => <WorkspaceAuthGuard><HousesListPage /></WorkspaceAuthGuard>
  } else if (pathname === '/clients' || pathname === '/clients/') {
    Component = () => <WorkspaceAuthGuard><ClientsListPage /></WorkspaceAuthGuard>
  } else if (pathname.startsWith('/house/')) {
    Component = () => <WorkspaceAuthGuard><HouseRecordPage /></WorkspaceAuthGuard>
  } else if (pathname.startsWith('/meeting/')) {
    Component = MeetingPage
  } else if (pathname.startsWith('/experiences')) {
    Component = ExperienceApp
  }

  // 本体ルートかつ HONTAI_PUBLIC=false → DevGuard でラップ（管理者のみ描画、他は /login）
  // Workspace系（_isWsPath）・HONTAI_PUBLIC=true はそのまま描画
  const needsGuard = !HONTAI_PUBLIC && !_isWsPath
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      {needsGuard ? <DevGuard><Component /></DevGuard> : <Component />}
    </StrictMode>,
  )
  // cache bust 2026年 4月29日 水曜日 19時04分58秒 JST
}
