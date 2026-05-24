import React from 'react';

export default function DigitalJapanMap({ activeArea, areaName, mapStatus }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '300px',
      overflow: 'hidden', borderRadius: '14px',
      background: 'radial-gradient(circle at center, rgba(37,99,235,0.18), transparent 58%), #050b1d',
      border: '1px solid rgba(212,175,55,0.18)', boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes pulseMap {
          0% { opacity: 0.9; transform: scale(0.4); }
          70% { opacity: 0.25; }
          100% { opacity: 0; transform: scale(1.4); }
        }
        @keyframes scanMove {
          0% { transform: translateY(-120px); }
          100% { transform: translateY(390px); }
        }
        .dj-pulse1, .dj-pulse2, .dj-pulse3 {
          transform-box: fill-box;
          transform-origin: center;
        }
        .dj-pulse1 { animation: pulseMap 2.4s ease-out infinite; }
        .dj-pulse2 { animation: pulseMap 2.4s ease-out 0.35s infinite; }
        .dj-pulse3 { animation: pulseMap 2.4s ease-out 0.7s infinite; }
      `}</style>

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: 'linear-gradient(180deg, transparent 0%, rgba(96,165,250,0.18) 50%, transparent 100%)',
        height: '90px', animation: 'scanMove 4s linear infinite',
      }} />

      <svg viewBox="0 0 420 310" style={{ width: '100%', height: '270px', display: 'block' }}>
        <defs>
          <filter id="djGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <rect width="420" height="310" fill="rgba(3,8,20,0.95)" rx="8"/>

        {[55, 110, 165, 220, 275].map(y => (
          <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="rgba(26,58,92,0.3)" strokeWidth="0.5" strokeDasharray="4,8"/>
        ))}
        {[70, 140, 210, 280, 350].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="310" stroke="rgba(26,58,92,0.3)" strokeWidth="0.5" strokeDasharray="4,8"/>
        ))}

        <ellipse cx="210" cy="155" rx="182" ry="152" fill="rgba(15,30,60,0.4)"/>

        <g transform="scale(1.4, 1.38)">
          <path d="M175 22 Q182 18 192 20 Q200 17 207 23 Q215 20 220 28 Q226 35 224 44 Q220 52 213 56 Q206 62 198 59 Q191 65 183 61 Q175 66 168 60 Q161 64 158 57 Q153 50 157 42 Q160 34 168 28 Z" fill="rgba(22,50,100,0.7)" stroke="rgba(100,160,255,0.35)" strokeWidth="0.8"/>
          <path d="M224 44 Q232 40 238 47 Q242 54 236 60 Q229 64 224 58 Q220 52 224 44Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.7"/>
          <path d="M168 60 Q172 65 168 71 Q163 75 158 70 Q156 64 160 60Z" fill="rgba(22,50,100,0.55)" stroke="rgba(100,160,255,0.25)" strokeWidth="0.7"/>
          <path d="M172 75 Q178 70 186 72 Q194 69 200 75 Q206 81 204 90 Q201 99 193 102 Q185 106 177 102 Q169 98 168 89 Q167 80 172 75Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
          <path d="M200 80 Q205 78 207 85 Q208 92 203 95 Q199 92 200 85Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>
          <path d="M170 108 Q177 103 185 106 Q193 103 198 110 Q203 117 200 126 Q196 134 188 136 Q180 139 172 134 Q164 129 163 120 Q162 111 170 108Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
          <path d="M196 122 Q202 119 205 126 Q207 133 202 138 Q197 139 195 133 Q193 126 196 122Z" fill="rgba(22,50,100,0.55)" stroke="rgba(100,160,255,0.25)" strokeWidth="0.7"/>
          <path d="M175 136 Q179 133 183 138 Q185 144 181 148 Q177 149 175 144 Q173 139 175 136Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>
          <path d="M148 105 Q156 100 163 104 Q167 111 164 120 Q160 128 152 128 Q144 126 141 118 Q139 109 148 105Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>
          <path d="M140 97 Q146 92 151 97 Q153 103 148 106 Q142 107 139 102Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.6"/>
          <path d="M155 124 Q162 119 169 123 Q173 130 170 139 Q165 146 157 146 Q149 143 147 134 Q145 125 155 124Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>
          <path d="M159 142 Q163 139 166 144 Q167 150 163 153 Q159 153 158 148Z" fill="rgba(22,50,100,0.45)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>
          <path d="M130 118 Q138 113 146 116 Q151 123 148 132 Q143 140 134 141 Q125 139 122 130 Q119 121 130 118Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
          <path d="M130 141 Q137 138 142 145 Q145 153 140 159 Q133 161 128 155 Q123 148 130 141Z" fill="rgba(22,50,100,0.55)" stroke="rgba(100,160,255,0.25)" strokeWidth="0.7"/>
          <path d="M108 122 Q117 116 126 120 Q131 127 128 136 Q122 143 113 142 Q104 139 102 130 Q100 121 108 122Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>
          <path d="M106 118 Q112 114 117 119 Q116 124 110 124 Q105 122 106 118Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>
          <path d="M117 148 Q126 143 135 147 Q140 154 137 163 Q131 170 121 169 Q111 166 109 157 Q107 148 117 148Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>
          <path d="M96 138 Q105 132 114 136 Q120 143 118 153 Q114 163 105 166 Q95 167 89 159 Q83 150 88 141 Q92 136 96 138Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
          <path d="M93 166 Q98 163 103 168 Q105 175 100 179 Q94 179 92 173Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.7"/>
          <path d="M103 166 Q108 163 111 169 Q112 176 107 179 Q102 178 101 172Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.7"/>
          <path d="M86 198 Q91 195 95 199 Q96 204 92 206 Q87 206 86 202Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.6"/>
          <path d="M72 206 Q76 204 78 207 Q79 210 76 211 Q73 211 72 208Z" fill="rgba(22,50,100,0.45)" stroke="rgba(100,160,255,0.18)" strokeWidth="0.5"/>
        </g>

        <line x1="0" y1="0" x2="420" y2="0" stroke="rgba(100,160,255,0.25)" strokeWidth="1.5">
          <animateTransform attributeName="transform" type="translate" from="0,0" to="0,310" dur="5s" repeatCount="indefinite"/>
        </line>

        <circle cx="196" cy="117" r="1.5" fill="rgba(212,175,55,0.4)">
          <animateTransform attributeName="transform" type="translate" values="0,0; 6,-10; 0,0" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="259" cy="166" r="1.2" fill="rgba(100,200,255,0.4)">
          <animateTransform attributeName="transform" type="translate" values="0,0; -5,8; 0,0" dur="5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="161" cy="214" r="1.5" fill="rgba(212,175,55,0.35)">
          <animateTransform attributeName="transform" type="translate" values="0,0; 8,5; 0,0" dur="6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="6s" repeatCount="indefinite"/>
        </circle>

        {activeArea ? (
          <g filter="url(#djGlow)">
            <circle cx={activeArea.cx} cy={activeArea.cy} r="5" fill="#22c55e"/>
            <circle className="dj-pulse1" cx={activeArea.cx} cy={activeArea.cy} r="12" fill="rgba(34,197,94,0.35)"/>
            <circle className="dj-pulse2" cx={activeArea.cx} cy={activeArea.cy} r="18" fill="rgba(34,197,94,0.2)"/>
            <circle className="dj-pulse3" cx={activeArea.cx} cy={activeArea.cy} r="24" fill="rgba(34,197,94,0.1)"/>
            <line x1={activeArea.cx - 14} y1={activeArea.cy} x2={activeArea.cx - 8} y2={activeArea.cy} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
            <line x1={activeArea.cx + 8} y1={activeArea.cy} x2={activeArea.cx + 14} y2={activeArea.cy} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
            <line x1={activeArea.cx} y1={activeArea.cy - 14} x2={activeArea.cx} y2={activeArea.cy - 8} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
            <line x1={activeArea.cx} y1={activeArea.cy + 8} x2={activeArea.cx} y2={activeArea.cy + 14} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
            <rect x={activeArea.cx - 28} y={activeArea.cy + 16} width="56" height="16" rx="3" fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5"/>
            <text x={activeArea.cx} y={activeArea.cy + 27} textAnchor="middle" fontSize="9" fill="#D4AF37" fontWeight="bold">{activeArea.name}</text>
          </g>
        ) : null}
      </svg>

      <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center', fontSize: '11px', letterSpacing: '1px' }}>
        {mapStatus === 0 ? (
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>住所を入力するとエリアが発光します</span>
        ) : mapStatus === 1 ? (
          <span style={{ color: 'rgba(212,175,55,0.8)' }}>{areaName}エリアを解析中…</span>
        ) : (
          <span style={{ color: 'rgba(74,222,128,0.9)' }}>周辺データ取得完了 — 査定実行可能</span>
        )}
      </div>
    </div>
  );
}
