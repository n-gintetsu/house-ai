import React from 'react';

export default function DigitalJapanMap({ activeArea, areaName, mapStatus }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '340px',
      overflow: 'hidden',
      borderRadius: '14px',
      background: '#050b1d',
      border: '1px solid rgba(212,175,55,0.2)',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes djScan {
          0% { transform: translateY(-80px); opacity: 0.5; }
          100% { transform: translateY(420px); opacity: 0; }
        }
        @keyframes djPulse1 {
          0% { r: 6; opacity: 0.9; }
          100% { r: 36; opacity: 0; }
        }
        @keyframes djPulse2 {
          0% { r: 6; opacity: 0.7; }
          100% { r: 54; opacity: 0; }
        }
        @keyframes djPulse3 {
          0% { r: 6; opacity: 0.5; }
          100% { r: 72; opacity: 0; }
        }
        @keyframes djDrift1 {
          0%, 100% { transform: translate(0,0); opacity: 0.6; }
          50% { transform: translate(5px,-8px); opacity: 0.2; }
        }
        @keyframes djDrift2 {
          0%, 100% { transform: translate(0,0); opacity: 0.5; }
          50% { transform: translate(-6px,6px); opacity: 0.2; }
        }
        @keyframes djFlow {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes djGlowAnim {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .dj-scan { animation: djScan 5s linear infinite; }
        .dj-p1 { animation: djPulse1 2.4s ease-out infinite; }
        .dj-p2 { animation: djPulse2 2.4s ease-out 0.5s infinite; }
        .dj-p3 { animation: djPulse3 2.4s ease-out 1s infinite; }
        .dj-d1 { animation: djDrift1 3.5s ease-in-out infinite; }
        .dj-d2 { animation: djDrift2 5s ease-in-out 1s infinite; }
        .dj-d3 { animation: djDrift1 7s ease-in-out 2s infinite; }
        .dj-flow { stroke-dasharray: 6 4; animation: djFlow 2s linear infinite; }
        .dj-glow { animation: djGlowAnim 2s ease-in-out infinite; }
      `}</style>

      {/* スキャンライン */}
      <div className="dj-scan" style={{
        position: 'absolute', left: 0, right: 0,
        height: '60px',
        background: 'linear-gradient(180deg, transparent, rgba(96,165,250,0.15), transparent)',
        pointerEvents: 'none', zIndex: 5,
      }} />

      {/* グリッド背景 */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      {/* 本物の日本地図SVG */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -52%) scale(0.62)',
        transformOrigin: 'center center',
        width: '480px',
        height: '520px',
        filter: 'drop-shadow(0 0 8px rgba(74,144,217,0.4))',
      }}>
        <img
          src="/japan_map.svg"
          alt="日本地図"
          style={{
            width: '100%',
            height: '100%',
            filter: 'brightness(0) saturate(100%) invert(20%) sepia(80%) saturate(400%) hue-rotate(190deg) brightness(90%)',
            opacity: 0.85,
          }}
        />
      </div>

      {/* SVGオーバーレイ（アニメーション層） */}
      <svg
        viewBox="0 0 300 340"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 3 }}
      >
        <defs>
          <filter id="djGlowFilter">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* データ粒子 */}
        <circle cx="155" cy="90" r="1.5" fill="rgba(212,175,55,0.6)" className="dj-d1"/>
        <circle cx="120" cy="160" r="1.2" fill="rgba(96,165,250,0.5)" className="dj-d2"/>
        <circle cx="200" cy="130" r="1.5" fill="rgba(212,175,55,0.4)" className="dj-d3"/>
        <circle cx="100" cy="120" r="1" fill="rgba(34,197,94,0.5)" className="dj-d1"/>
        <circle cx="170" cy="180" r="1.2" fill="rgba(212,175,55,0.35)" className="dj-d2"/>

        {/* データ通信ライン */}
        {activeArea ? (
          <g>
            <path d="M184 148 Q163 158 148 165" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="0.8" className="dj-flow"/>
            <path d="M148 165 Q128 175 112 182" fill="none" stroke="rgba(212,175,55,0.25)" strokeWidth="0.6" className="dj-flow"/>
          </g>
        ) : null}

        {/* アクティブポイント */}
        {activeArea ? (
          <g filter="url(#djGlowFilter)">
            <circle cx={activeArea.cx * 300 / 480} cy={activeArea.cy * 340 / 520} r="5" fill="#22c55e" opacity="0.95"/>
            <circle cx={activeArea.cx * 300 / 480} cy={activeArea.cy * 340 / 520} r="5" fill="none" stroke="#d4af37" strokeWidth="1.5" className="dj-p1"/>
            <circle cx={activeArea.cx * 300 / 480} cy={activeArea.cy * 340 / 520} r="5" fill="none" stroke="#d4af37" strokeWidth="1" className="dj-p2"/>
            <circle cx={activeArea.cx * 300 / 480} cy={activeArea.cy * 340 / 520} r="5" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="0.6" className="dj-p3"/>
            <line
              x1={activeArea.cx * 300 / 480 - 12} y1={activeArea.cy * 340 / 520}
              x2={activeArea.cx * 300 / 480 - 7} y2={activeArea.cy * 340 / 520}
              stroke="rgba(212,175,55,0.8)" strokeWidth="1"/>
            <line
              x1={activeArea.cx * 300 / 480 + 7} y1={activeArea.cy * 340 / 520}
              x2={activeArea.cx * 300 / 480 + 12} y2={activeArea.cy * 340 / 520}
              stroke="rgba(212,175,55,0.8)" strokeWidth="1"/>
            <line
              x1={activeArea.cx * 300 / 480} y1={activeArea.cy * 340 / 520 - 12}
              x2={activeArea.cx * 300 / 480} y2={activeArea.cy * 340 / 520 - 7}
              stroke="rgba(212,175,55,0.8)" strokeWidth="1"/>
            <line
              x1={activeArea.cx * 300 / 480} y1={activeArea.cy * 340 / 520 + 7}
              x2={activeArea.cx * 300 / 480} y2={activeArea.cy * 340 / 520 + 12}
              stroke="rgba(212,175,55,0.8)" strokeWidth="1"/>
            <rect
              x={activeArea.cx * 300 / 480 - 22}
              y={activeArea.cy * 340 / 520 + 14}
              width="44" height="14" rx="3"
              fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.6)" strokeWidth="0.5"/>
            <text
              x={activeArea.cx * 300 / 480}
              y={activeArea.cy * 340 / 520 + 24}
              textAnchor="middle" fontSize="8" fill="#d4af37"
              fontWeight="bold" fontFamily="monospace">{areaName}</text>
          </g>
        ) : null}

        {/* 座標ラベル */}
        <text x="8" y="330" fontSize="7" fill="rgba(96,165,250,0.25)" fontFamily="monospace">130°E</text>
        <text x="140" y="330" fontSize="7" fill="rgba(96,165,250,0.25)" fontFamily="monospace">135°E</text>
        <text x="268" y="330" fontSize="7" fill="rgba(96,165,250,0.25)" fontFamily="monospace">141°E</text>
        <text x="270" y="80" fontSize="7" fill="rgba(96,165,250,0.25)" fontFamily="monospace">43°N</text>
        <text x="270" y="168" fontSize="7" fill="rgba(96,165,250,0.25)" fontFamily="monospace">35°N</text>

        {/* ライブドット */}
        <circle cx="14" cy="14" r="3" fill="#22c55e" className="dj-glow"/>
        <text x="22" y="18" fontSize="8" fill="rgba(34,197,94,0.7)" fontFamily="monospace">LIVE</text>
      </svg>

      {/* ステータステキスト */}
      <div style={{
        position: 'absolute', bottom: '10px', left: 0, right: 0,
        textAlign: 'center', fontSize: '11px',
        fontFamily: 'monospace', letterSpacing: '1px', zIndex: 6,
      }}>
        {mapStatus === 0 ? (
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>住所を入力するとエリアが発光します</span>
        ) : mapStatus === 1 ? (
          <span style={{ color: 'rgba(212,175,55,0.8)' }}>{areaName}エリアを解析中…</span>
        ) : (
          <span style={{ color: 'rgba(74,222,128,0.9)' }}>周辺データ取得完了 — 査定実行可能</span>
        )}
      </div>
    </div>
  );
}
