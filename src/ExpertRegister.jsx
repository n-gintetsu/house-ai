import { useState } from 'react';
import { supabase } from './supabaseClient';

const NAVY = '#1a3a5c';
const GOLD = '#c9a84c';

export default function ExpertRegister({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [field, setField] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!name || !email) {
      setError('お名前とメールアドレスは必須です');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase
      .from('expert_registrations')
      .insert([{ name, email, area, field }]);
    if (err) {
      setError(err.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div style={{ background: 'white', maxWidth: 480, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <h2 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: '16px 0 12px' }}>登録が完了しました！</h2>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: '0 0 28px' }}>
          審査完了後、ご登録のメールアドレスにご連絡いたします。<br />
          まずはダッシュボードで相談の仕組みを確認してみましょう。
        </p>
        <button
          onClick={() => onNavigate('expertdashboard')}
          style={{ background: GOLD, color: NAVY, border: 'none', borderRadius: 12, height: 52, width: '100%', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ダッシュボードを見る
        </button>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: 16,
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '0 0 40px' }}>
      <div style={{ backgroundColor: NAVY, padding: '20px 24px', textAlign: 'center', position: 'relative' }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ← 戻る
        </button>
        <span style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>🏛️ 専門家登録</span>
      </div>

      <div style={{ maxWidth: 480, margin: '24px auto', backgroundColor: 'white', borderRadius: 16, padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: NAVY, textAlign: 'center', marginBottom: 8, marginTop: 0 }}>
          営業なしで相談が届く、新しい集客
        </p>
        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 24, marginTop: 0 }}>
          AIがユーザーの悩みを整理し、必要な相談だけ届きます
        </p>

        <div style={{ background: '#f0f4ff', borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <p style={{ margin: '0 0 6px', fontSize: 14 }}>✅ 完全無料で開始できます</p>
          <p style={{ margin: '0 0 6px', fontSize: 14 }}>✅ AIが相談を整理して届けます</p>
          <p style={{ margin: 0, fontSize: 14 }}>✅ 営業・勧誘は一切ありません</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>お名前 *</label>
            <input
              type="text"
              placeholder="山田 太郎"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>メールアドレス *</label>
            <input
              type="email"
              placeholder="example@office.jp"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>対応エリア</label>
            <input
              type="text"
              placeholder="例：埼玉県・東京都"
              value={area}
              onChange={e => setArea(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>対応分野</label>
            <input
              type="text"
              placeholder="例：相続・税金・登記"
              value={field}
              onChange={e => setField(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8, marginTop: 12 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: GOLD, color: NAVY, border: 'none', borderRadius: 12, height: 52, width: '100%', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' }}
        >
          {loading ? '送信中...' : '無料で始める'}
        </button>

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
          ※料金・プランの案内は一切ありません<br />
          ※登録後に相談の仕組みをご確認いただけます
        </p>
      </div>
    </div>
  );
}
