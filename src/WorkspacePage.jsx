import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, FileText, UserCheck, FileSignature, CreditCard, Map,
  Check, Users, Calendar, Send, AlertCircle
} from 'lucide-react'

const CASE = {
  id: 'WS-2026-000001',
  clientName: '山田様',
  property: 'さいたま市〇〇マンション',
  type: '購入',
  client: '山田太郎',
  staff: '自社スタッフ',
  contractType: '売買',
  status: '契約準備中',
  updatedAt: '2026/06/04',
  progress: 60,
}

const FILES = [
  { id: 1, icon: FileText,      name: '申込書',                   shared: ['顧客', '担当'] },
  { id: 2, icon: UserCheck,     name: '本人確認書類',             shared: ['担当'] },
  { id: 3, icon: FileSignature, name: '重要事項説明書（ドラフト）', shared: ['顧客', '担当', '宅建士'] },
  { id: 4, icon: CreditCard,    name: 'ローン事前審査書類',       shared: ['担当', '銀行'] },
  { id: 5, icon: Map,           name: '物件図面',                 shared: ['顧客', '担当'] },
]

const STEPS = [
  { label: '問い合わせ',     status: 'done' },
  { label: '内見',           status: 'done' },
  { label: '購入申込',       status: 'done' },
  { label: 'ローン事前審査', status: 'done' },
  { label: 'ローン本審査',   status: 'active' },
  { label: '契約',           status: 'pending' },
  { label: '決済',           status: 'pending' },
  { label: '登記',           status: 'pending' },
  { label: '引渡し',         status: 'pending' },
  { label: '完了',           status: 'pending' },
]

const TIMELINE = [
  { date: '6/1',  event: '内見実施' },
  { date: '6/3',  event: '購入申込' },
  { date: '6/5',  event: '事前審査開始' },
  { date: '6/8',  event: '事前審査承認' },
  { date: '6/10', event: '本審査申込' },
]

const NOTIFICATIONS = [
  { id: 1, text: '司法書士の書類が未提出です',   urgent: true },
  { id: 2, text: '契約予定日が近づいています',   urgent: false },
]

const MEMBERS = [
  { name: '山田太郎',     role: '顧客',       level: 'Guest' },
  { name: '自社担当',     role: '担当',       level: 'Owner' },
  { name: '〇〇司法書士', role: '司法書士',   level: 'Member' },
  { name: '△△銀行担当',  role: '銀行',       level: 'Member' },
  { name: '□□リフォーム', role: 'リフォーム', level: 'Member' },
]

const SCHEDULES = [
  { date: '6/12', event: '本審査結果連絡' },
  { date: '6/20', event: '売買契約' },
]

const glass = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
}

export default function WorkspacePage() {
  const [chatInput, setChatInput] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <style>{`
        .ws-grid { display: grid; grid-template-columns: 260px 1fr 280px; gap: 16px; }
        @media (max-width: 960px) { .ws-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ヘッダー - 本物ガラス */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        background: 'rgba(10,15,30,0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {CASE.clientName}｜{CASE.property} {CASE.type}
          </div>
          <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>{CASE.id}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {[
            { label: '顧客',     value: CASE.client },
            { label: '担当',     value: CASE.staff },
            { label: '契約種別', value: CASE.contractType },
            { label: 'ステータス', value: CASE.status },
            { label: '最終更新', value: CASE.updatedAt },
          ].map(chip => (
            <div key={chip.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '3px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#64748B', fontWeight: 400 }}>{chip.label}</div>
              <div style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 500 }}>{chip.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 100, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${CASE.progress}%`, background: 'linear-gradient(90deg, #c9a84c, #D4AF37)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{CASE.progress}%</span>
        </div>

        <div style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <Bell size={18} color="#94A3B8" />
          <div style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>2</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main style={{ paddingTop: 80, paddingBottom: 140, paddingLeft: 20, paddingRight: 20, maxWidth: 1440, margin: '0 auto', boxSizing: 'border-box' }}>
        <div className="ws-grid">

          {/* 左カラム：ファイル */}
          <div style={{ ...glass, borderRadius: 14, padding: 20, height: 'fit-content' }}>
            <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>FILE</div>
            <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 16 }}>ファイル</div>
            {FILES.map(file => {
              const Icon = file.icon
              return (
                <div key={file.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <Icon size={15} color="#c9a84c" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400, marginBottom: 5, lineHeight: 1.4 }}>{file.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {file.shared.map(tag => (
                        <span key={tag} style={{ fontSize: 9, background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 3, padding: '1px 5px', fontWeight: 400 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 中央カラム：ロードマップ＋タイムライン */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 進捗ロードマップ */}
            <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>ROADMAP</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 24 }}>進捗ロードマップ（売買）</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', overflowX: 'auto' }}>
                {STEPS.map((step, idx) => (
                  <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      {step.status === 'done' ? (
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="#c9a84c" />
                        </div>
                      ) : step.status === 'active' ? (
                        <motion.div
                          animate={{ boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 20px 4px rgba(59,130,246,0.75)', '0 0 0px rgba(59,130,246,0)'] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                          style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ width: 10, height: 10, borderRadius: '50%', background: '#60A5FA' }}
                          />
                        </motion.div>
                      ) : (
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
                        </div>
                      )}
                      <span style={{
                        fontSize: 10,
                        fontWeight: step.status === 'active' ? 500 : 400,
                        color: step.status === 'done' ? '#c9a84c' : step.status === 'active' ? '#60A5FA' : '#475569',
                        whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 58, lineHeight: 1.3,
                      }}>{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 ? (
                      <div style={{ width: 20, height: 2, background: idx < 4 ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)', marginBottom: 26, flexShrink: 0 }} />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* タイムライン */}
            <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>TIMELINE</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 20 }}>タイムライン</div>
              {TIMELINE.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a84c', marginTop: 3 }} />
                    {idx < TIMELINE.length - 1 ? (
                      <div style={{ width: 1, height: 32, background: 'rgba(201,168,76,0.25)', marginTop: 4 }} />
                    ) : null}
                  </div>
                  <div style={{ paddingBottom: idx < TIMELINE.length - 1 ? 8 : 0 }}>
                    <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500, marginRight: 10 }}>{item.date}</span>
                    <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400 }}>{item.event}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* 右カラム：通知・関係者・次回予定 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 通知 */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>NOTICE</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>通知</div>
              {NOTIFICATIONS.map((n, idx) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 10px', borderRadius: 8, background: n.urgent ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.04)', border: n.urgent ? '1px solid rgba(239,68,68,0.22)' : '1px solid rgba(255,255,255,0.06)', marginBottom: idx < NOTIFICATIONS.length - 1 ? 8 : 0 }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <AlertCircle size={13} color={n.urgent ? '#F87171' : '#64748B'} />
                  </div>
                  <span style={{ fontSize: 12, color: n.urgent ? '#FCA5A5' : '#94A3B8', fontWeight: 400, lineHeight: 1.5 }}>{n.text}</span>
                </div>
              ))}
            </div>

            {/* 関係者 */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Users size={12} color="#c9a84c" />
                <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3 }}>MEMBERS</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>関係者</div>
              {MEMBERS.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < MEMBERS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 400 }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{m.role}</div>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 400,
                    background: m.level === 'Owner' ? 'rgba(201,168,76,0.14)' : m.level === 'Guest' ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.07)',
                    color: m.level === 'Owner' ? '#c9a84c' : m.level === 'Guest' ? '#818CF8' : '#94A3B8',
                    border: m.level === 'Owner' ? '1px solid rgba(201,168,76,0.25)' : m.level === 'Guest' ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.1)',
                  }}>{m.level}</span>
                </div>
              ))}
            </div>

            {/* 次回予定 */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Calendar size={12} color="#c9a84c" />
                <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3 }}>SCHEDULE</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>次回予定</div>
              {SCHEDULES.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: idx < SCHEDULES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 7, padding: '5px 9px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500 }}>{s.date}</div>
                  </div>
                  <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400 }}>{s.event}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      {/* AI案件秘書 - 本物ガラス・固定右下 */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 200,
        width: 340,
        background: 'rgba(10,15,30,0.84)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(201,168,76,0.32)',
        borderRadius: 14,
        boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 20px rgba(201,168,76,0.1)',
      }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* /logo.png を採用。コンシェルジュ/調査室と同じ円形アバター作りで統一 */}
          <img src="/logo.png" alt="AI" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#000', border: '2px solid #c9a84c', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>AI案件秘書</span>
          <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
        </div>
        <div style={{ padding: '14px 14px 12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 11px', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 400, lineHeight: 1.6 }}>
              ローン本審査が進行中です。結果は6/12予定です。
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {['火災保険比較を行う', 'リフォーム見積を取得'].map(chip => (
              <button key={chip} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', cursor: 'pointer', fontWeight: 400 }}>
                {chip}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="AIに質問する..."
              rows={2}
              style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', padding: '7px 10px', borderRadius: 7, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Send size={12} />
                送信
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
