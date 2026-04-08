import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

export default function TickerBanner() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fallbackItems = [
    { id: 1, label: 'PR', text: 'GINTETSUのAIコンシェルジュが不動産のお悩みを24時間サポート', url: 'https://www.gintetsu-fudosan.com', active: true },
    { id: 2, label: '提携', text: '住宅ローンのご相談はお気軽に｜ご成約者様に提携金融機関をご紹介', url: 'https://www.gintetsu-fudosan.com', active: true },
    { id: 3, label: 'PR', text: 'リフォーム・外構工事のご相談｜信頼の提携業者をご紹介します', url: 'https://www.gintetsu-fudosan.com', active: true },
  ]

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('ticker_items')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (error || !data || data.length === 0) {
        setItems(fallbackItems)
      } else {
        setItems(data)
      }
    } catch (e) {
      setItems(fallbackItems)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading || items.length === 0) return null

  const doubled = [...items, ...items]

  const labelColor = {
    'PR': { bg: 'rgba(201,168,76,0.25)', border: '#c9a84c', text: '#c9a84c' },
    '広告': { bg: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.5)', text: '#fff' },
    '提携': { bg: 'rgba(100,200,150,0.25)', border: '#6fcf97', text: '#6fcf97' },
    'お知らせ': { bg: 'rgba(100,160,255,0.25)', border: '#82b4ff', text: '#82b4ff' },
  }

  return (
    <div style={{
      background: '#1a3a5c',
      padding: '9px 0',
      overflow: 'hidden',
      width: '100%',
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        background: '#c9a84c',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '600',
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 2,
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}>
        INFO
      </div>

      <div style={{ paddingLeft: '72px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          animation: `tickerScroll ${items.length * 8}s linear infinite`,
        }}>
          {doubled.map((item, idx) => {
            const colors = labelColor[item.label] || labelColor['PR']
            const hasUrl = item.url && item.url.trim() !== ''
            return (
              <div
                key={idx}
                onClick={() => hasUrl && handleClick(item.url)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  padding: '0 28px',
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid rgba(255,255,255,0.15)',
                  cursor: hasUrl ? 'pointer' : 'default',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => { if (hasUrl) e.currentTarget.style.opacity = '0.75' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                <span style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  letterSpacing: '0.05em',
                }}>
                  {item.label}
                </span>
                <span>{item.text}</span>
                {hasUrl && (
                  <span style={{ color: '#c9a84c', fontSize: '11px' }}>›</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
