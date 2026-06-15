import { useState, useEffect } from 'react'
import { Home, FolderOpen, MessageSquare, Calendar, Sparkles, Loader, Check, X } from 'lucide-react'
import { supabase } from './supabaseClient'

const NAV_TABS = [
  { label: '案件',   icon: Home },
  { label: '資料',   icon: FolderOpen },
  { label: 'チャット', icon: MessageSquare },
  { label: '予定',   icon: Calendar },
  { label: 'AI',    icon: Sparkles },
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function formatMD(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const p = dateStr.split('-')
    return `${parseInt(p[1])}/${parseInt(p[2])}`
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function stepLabelColor(state) {
  if (state === '完了')    return '#c9a84c'
  if (state === '進行中')  return '#60A5FA'
  if (state === '承認待ち') return '#FCD34D'
  if (state === '差戻し')  return '#F87171'
  return '#475569'
}

function StepDot({ state }) {
  if (state === '完了') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check size={12} color="#c9a84c" />
      </div>
    )
  }
  if (state === '進行中') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '2px solid #60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA' }} />
      </div>
    )
  }
  if (state === '承認待ち') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '2px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FCD34D' }} />
      </div>
    )
  }
  if (state === '差戻し') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid #F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <X size={12} color="#F87171" />
      </div>
    )
  }
  return (
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569' }} />
    </div>
  )
}

const CARD_STYLE = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
  borderRadius: 16,
  padding: 16,
}

export default function MobileWorkspaceLayout() {
  const id = new URLSearchParams(window.location.search).get('id')
  const [workspace, setWorkspace] = useState(null)
  const [steps, setSteps] = useState([])
  const [schedule, setSchedule] = useState([])
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (!id) { setLoading(false); setFailed(true); return }
    async function fetchAll() {
      const [{ data: wsData, error: wsError }, { data: stepsData }, { data: scheduleData }, { data: timelineData }] = await Promise.all([
        supabase.from('workspaces').select('*').eq('id', id).is('deleted_at', null).maybeSingle(),
        supabase.from('roadmap_steps').select('id, label, state, step_order').eq('workspace_id', id).order('step_order', { ascending: true }),
        supabase.from('ws_schedule').select('id, scheduled_date, label').eq('workspace_id', id).order('scheduled_date', { ascending: true }),
        supabase.from('timeline_events').select('id, event_date, label').eq('workspace_id', id).order('event_date', { ascending: true }),
      ])
      if (wsError || !wsData) { setFailed(true); setLoading(false); return }
      setWorkspace(wsData)
      setSteps(stepsData || [])
      setSchedule(scheduleData || [])
      setTimeline(timelineData || [])
      setLoading(false)
    }
    fetchAll()
  }, [id])

  const progress = (workspace && workspace.progress) ? workspace.progress : 0
  const statusColor = (workspace && workspace.status === '完了') ? '#D4AF37' : '#38bdf8'
  const statusBg = (workspace && workspace.status === '完了') ? 'rgba(212,175,55,0.15)' : 'rgba(56,189,248,0.15)'
  const statusBorder = (workspace && workspace.status === '完了') ? 'rgba(212,175,55,0.4)' : 'rgba(56,189,248,0.4)'

  const lastDoneIdx = steps.reduce((acc, s, i) => s.state === '完了' ? i : acc, -1)

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

      <div style={{ flex: 1, padding: '24px 16px 80px', boxSizing: 'border-box' }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 }}>
            <Loader size={18} color="#c9a84c" />
            <span style={{ fontSize: 14, fontWeight: 400, color: '#64748B' }}>読み込み中...</span>
          </div>
        ) : failed || !workspace ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <span style={{ fontSize: 13, fontWeight: 400, color: '#c9a84c' }}>案件が見つかりません</span>
          </div>
        ) : activeTab !== 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: '#475569' }}>{NAV_TABS[activeTab].label}は準備中です</span>
          </div>
        ) : (
          <div>

            {/* サマリーカード */}
            <div style={CARD_STYLE}>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#c9a84c', lineHeight: 1.3 }}>
                    {workspace.customer_name || '-'}様
                  </div>
                  {workspace.ws_code ? (
                    <div style={{ fontSize: 10, fontWeight: 400, color: '#475569', marginTop: 3, letterSpacing: 1 }}>{workspace.ws_code}</div>
                  ) : null}
                </div>
                <span style={{ fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 20, color: statusColor, background: statusBg, border: `1px solid ${statusBorder}`, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
                  {workspace.status || '-'}
                </span>
              </div>

              {workspace.title ? (
                <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {workspace.title}
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {workspace.contract_type ? (
                  <span style={{ fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 20, color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)' }}>
                    {workspace.contract_type}
                  </span>
                ) : null}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B', minWidth: 40 }}>担当</span>
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#E2E8F0' }}>{workspace.agent_name || '-'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B', minWidth: 40 }}>更新日</span>
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#E2E8F0' }}>{formatDate(workspace.updated_at)}</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B' }}>進捗</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c' }}>{progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #c9a84c, #D4AF37)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
              </div>

            </div>

            {/* ロードマップカード */}
            {steps.length > 0 ? (
              <div style={{ ...CARD_STYLE, marginTop: 16 }}>

                <div style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c', marginBottom: 16, letterSpacing: 0.5 }}>進捗ロードマップ</div>

                <div style={{ paddingLeft: 4 }}>
                  {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1
                    const lineColor = idx < lastDoneIdx ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)'
                    return (
                      <div key={step.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <StepDot state={step.state} />
                          {isLast ? null : (
                            <div style={{ width: 2, flex: 1, minHeight: 24, background: lineColor, marginTop: 3, marginBottom: 3 }} />
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: isLast ? 0 : 20, minHeight: 18 }}>
                          <span style={{ fontSize: 14, fontWeight: step.state === '進行中' ? 500 : 400, color: stepLabelColor(step.state) }}>
                            {step.label}
                          </span>
                          {step.state === '進行中' ? (
                            <span style={{ fontSize: 10, fontWeight: 400, padding: '2px 7px', borderRadius: 20, color: '#60A5FA', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(96,165,250,0.35)', whiteSpace: 'nowrap' }}>
                              進行中
                            </span>
                          ) : null}
                        </div>

                      </div>
                    )
                  })}
                </div>

              </div>
            ) : null}

            {/* 次回予定カード */}
            <div style={{ ...CARD_STYLE, marginTop: 16 }}>

              <div style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c', marginBottom: 14, letterSpacing: 0.5 }}>次回予定</div>

              {schedule.length === 0 ? (
                <div style={{ fontSize: 13, fontWeight: 400, color: '#475569' }}>予定はありません</div>
              ) : (
                <div>
                  {schedule.map((s, idx) => (
                    <div key={s.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: idx < schedule.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 7, padding: '4px 8px', textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatMD(s.scheduled_date)}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 400, color: '#CBD5E1', flex: 1 }}>{s.label || ''}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* タイムラインカード */}
            <div style={{ ...CARD_STYLE, marginTop: 16 }}>

              <div style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c', marginBottom: 14, letterSpacing: 0.5 }}>タイムライン</div>

              {timeline.length === 0 ? (
                <div style={{ fontSize: 13, fontWeight: 400, color: '#475569' }}>履歴はありません</div>
              ) : (
                <div>
                  {timeline.map((item, idx) => {
                    const isLast = idx === timeline.length - 1
                    return (
                      <div key={item.id || idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a84c', marginTop: 3, flexShrink: 0 }} />
                          {isLast ? null : (
                            <div style={{ width: 1, height: 32, background: 'rgba(201,168,76,0.25)', marginTop: 4 }} />
                          )}
                        </div>
                        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 8 }}>
                          <span style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500, marginRight: 10 }}>{formatMD(item.event_date)}</span>
                          <span style={{ fontSize: 14, fontWeight: 400, color: '#94A3B8' }}>{item.label || ''}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(10,15,30,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 200, boxSizing: 'border-box' }}>
        {NAV_TABS.map((tab, i) => {
          const Icon = tab.icon
          const active = activeTab === i
          return (
            <div key={tab.label} onClick={() => setActiveTab(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, cursor: 'pointer' }}>
              <Icon size={20} color={active ? '#c9a84c' : '#475569'} />
              <span style={{ fontSize: 10, fontWeight: 400, color: active ? '#c9a84c' : '#475569' }}>{tab.label}</span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
