import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import AreaAutocomplete from './AreaAutocomplete';
import { supabase } from './supabaseClient';

const propertyTypes = [{ id:'rent', label:'賃貸' }, { id:'sale', label:'売買' }, { id:'investment', label:'投資' }, { id:'tenant', label:'テナント' }, { id:'land', label:'土地' }, { id:'other', label:'その他' }];
const layouts = ['1R','1K','1DK','1LDK','2DK','2LDK','3LDK','4LDK+'];
const priorityTags = ['在宅ワーク','静か','眺望','駅近','ペット','デザイナーズ','新築','高級感','日当たり','セキュリティ'];

export default function CommunityCreatePage() {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState('rent');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [selectedLayouts, setSelectedLayouts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleLayout = (l) => setSelectedLayouts(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  const toggleTag = (t) => setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleAIAnalyze = () => setShowAIPreview(true);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { error: err } = await supabase.from('community_posts').insert([{
        property_type: propertyType,
        areas: selectedAreas,
        budget_min: minBudget ? parseInt(minBudget) * 10000 : null,
        budget_max: maxBudget ? parseInt(maxBudget) * 10000 : null,
        layouts: selectedLayouts,
        tags: selectedTags,
        free_text: freeText,
        ai_summary: `${propertyType === 'rent' ? '賃貸' : propertyType === 'sale' ? '売買' : '投資'}・${selectedAreas.join('、') || 'エリア未定'}・${maxBudget ? maxBudget + '万円以下' : '予算未定'}`,
        status: '募集中',
      }]);
      if (err) throw err;
      navigate('/community/success');
    } catch (e) {
      setError('送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingBottom: 80 }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,10,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 768, margin: '0 auto', padding: '24px 16px' }}>
          <button onClick={() => navigate('/community')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14 }}>
            <ArrowLeft size={16} />戻る
          </button>
          <h1 style={{ fontSize: 24, color: '#fff', marginBottom: 8 }}>理想の住まいを教えてください</h1>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>AIが条件を整理し、条件に合う業者から提案を受けられます。</p>
        </div>
      </div>
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* 希望種別 */}
            <div>
              <label style={{ color: '#fff', fontSize: 14, display: 'block', marginBottom: 12 }}>希望種別</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {propertyTypes.map(t => (
                  <button key={t.id} onClick={() => setPropertyType(t.id)}
                    style={{ padding: '10px 24px', borderRadius: 8, border: propertyType === t.id ? 'none' : '1px solid rgba(255,255,255,0.2)', background: propertyType === t.id ? '#eab308' : 'transparent', color: propertyType === t.id ? '#000' : '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* エリア */}
            <div>
              <label style={{ color: '#fff', fontSize: 14, display: 'block', marginBottom: 12 }}>エリア（複数選択可）</label>
              <AreaAutocomplete selectedAreas={selectedAreas} onAreasChange={setSelectedAreas} />
            </div>
            {/* 予算 */}
            <div>
              <label style={{ color: '#fff', fontSize: 14, display: 'block', marginBottom: 12 }}>予算（万円）</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <input type="number" placeholder="最低" value={minBudget} onChange={e => setMinBudget(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <span style={{ color: '#9ca3af' }}>〜</span>
                <input type="number" placeholder="最高" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            {/* 間取り */}
            <div>
              <label style={{ color: '#fff', fontSize: 14, display: 'block', marginBottom: 12 }}>間取り</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {layouts.map(l => (
                  <button key={l} onClick={() => toggleLayout(l)}
                    style={{ padding: '8px 16px', borderRadius: 9999, border: selectedLayouts.includes(l) ? 'none' : '1px solid rgba(255,255,255,0.2)', background: selectedLayouts.includes(l) ? '#eab308' : 'transparent', color: selectedLayouts.includes(l) ? '#000' : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: selectedLayouts.includes(l) ? 600 : 400 }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* 重視ポイント */}
            <div>
              <label style={{ color: '#fff', fontSize: 14, display: 'block', marginBottom: 12 }}>重視ポイント</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {priorityTags.map(t => (
                  <button key={t} onClick={() => toggleTag(t)}
                    style={{ padding: '8px 16px', borderRadius: 9999, border: selectedTags.includes(t) ? 'none' : '1px solid rgba(255,255,255,0.2)', background: selectedTags.includes(t) ? '#eab308' : 'transparent', color: selectedTags.includes(t) ? '#000' : '#fff', cursor: 'pointer', fontSize: 14 }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* 自由入力 */}
            <div>
              <label style={{ color: '#fff', fontSize: 14, display: 'block', marginBottom: 12 }}>理想の住まいを自由に入力</label>
              <textarea
                placeholder="例：渋谷周辺で在宅ワーク向き、静かな環境、ホテルライク、日当たり重視"
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                style={{ ...inputStyle, minHeight: 128, resize: 'vertical' }}
              />
            </div>
            {/* AIプレビュー */}
            {showAIPreview ? (
              <div style={{ background: 'linear-gradient(135deg,rgba(88,28,135,0.2),rgba(30,58,138,0.2))', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Sparkles size={20} color="#c084fc" />
                  <h3 style={{ color: '#fff', fontSize: 16 }}>AI整理結果</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                  <div><span style={{ color: '#9ca3af' }}>希望エリア: </span><span style={{ color: '#fff' }}>{selectedAreas.join('、') || '指定なし'}</span></div>
                  <div><span style={{ color: '#9ca3af' }}>予算: </span><span style={{ color: '#fff' }}>{maxBudget ? `${maxBudget}万円以下` : minBudget ? `${minBudget}万円以上` : '指定なし'}</span></div>
                  <div><span style={{ color: '#9ca3af' }}>間取り: </span><span style={{ color: '#fff' }}>{selectedLayouts.join('、') || '指定なし'}</span></div>
                  <div><span style={{ color: '#9ca3af' }}>重視ポイント: </span><span style={{ color: '#fff' }}>{selectedTags.join('、') || '指定なし'}</span></div>
                  {freeText ? <div><span style={{ color: '#9ca3af' }}>その他: </span><span style={{ color: '#fff' }}>{freeText}</span></div> : null}
                </div>
              </div>
            ) : null}
            {/* エラー */}
            {error ? <p style={{ color: '#f87171', fontSize: 14 }}>{error}</p> : null}
            {/* ボタン */}
            <div>
              {!showAIPreview ? (
                <button onClick={handleAIAnalyze}
                  style={{ width: '100%', height: 48, background: 'linear-gradient(90deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sparkles size={18} />AIで整理する
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ width: '100%', height: 48, background: submitting ? '#6b7280' : 'linear-gradient(90deg,#eab308,#ca8a04)', color: '#000', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? '送信中...' : 'この内容で投稿する'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
