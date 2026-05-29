import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

const areaDatabase = [
  '東京都渋谷区','東京都新宿区','東京都港区','東京都目黒区','東京都世田谷区',
  '東京都品川区','東京都中央区','東京都千代田区','東京都文京区','東京都台東区',
  '渋谷駅','恵比寿','代官山','中目黒','新宿駅','池袋駅',
  '横浜市中区','横浜市西区','横浜市神奈川区','川崎市川崎区','鎌倉市',
  '大阪市北区','大阪市中央区','大阪市西区','梅田','難波','心斎橋',
  '名古屋市中区','名古屋市千種区','名古屋市昭和区','名古屋駅',
  '福岡市中央区','福岡市博多区','天神','博多駅',
];

export default function AreaAutocomplete({ selectedAreas, onAreasChange }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (input.length > 0) {
      const filtered = areaDatabase.filter(a => a.toLowerCase().includes(input.toLowerCase()));
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const addArea = (area) => {
    if (!selectedAreas.includes(area)) onAreasChange([...selectedAreas, area]);
    setInput('');
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const removeArea = (area) => onAreasChange(selectedAreas.filter(a => a !== area));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {selectedAreas.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {selectedAreas.map(area => (
            <span key={area} style={{ background: 'rgba(234,179,8,0.2)', color: '#facc15', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 9999, padding: '6px 12px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} />{area}
              <button onClick={() => removeArea(area)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#facc15', display: 'flex', padding: 0 }}><X size={12} /></button>
            </span>
          ))}
        </div>
      ) : null}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="エリアを入力... (例: 渋谷、名古屋、横浜)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => { if (input) setShowSuggestions(true); }}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, boxSizing: 'border-box' }}
        />
        {showSuggestions && suggestions.length > 0 ? (
          <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: 8, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxHeight: 256, overflowY: 'auto' }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => addArea(s)} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <MapPin size={16} color="#6b7280" />{s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>人気エリア</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['東京都渋谷区','東京都新宿区','横浜市中区','名古屋市中区'].map(area => (
            <button key={area} onClick={() => addArea(area)} disabled={selectedAreas.includes(area)}
              style={{ padding: '6px 12px', fontSize: 12, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', color: selectedAreas.includes(area) ? '#4b5563' : '#9ca3af', border: '1px solid rgba(255,255,255,0.1)', cursor: selectedAreas.includes(area) ? 'default' : 'pointer' }}>
              {area}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
