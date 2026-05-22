import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ChevronLeft } from 'lucide-react';

const NAVY = '#1a3a5c';
const GOLD = '#c9a84c';
const BG = '#F7F9FC';

function formatYen(n) {
  return Math.round(n || 0).toLocaleString('ja-JP') + '円';
}

function calcStampDuty(priceYen) {
  if (priceYen <= 10000000) return 5000;
  if (priceYen <= 50000000) return 10000;
  if (priceYen <= 100000000) return 30000;
  if (priceYen <= 500000000) return 60000;
  return 160000;
}

const FIELD_STYLE = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '16px',
  borderRadius: '10px',
  border: '1.5px solid #E2E8F0',
  color: '#102A43',
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  outline: 'none',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#5C677D',
  marginBottom: '4px',
};

const ROW_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid #F1F5F9',
};

export default function CostCalculatorPage({ onBack }) {
  const [tab, setTab] = useState('rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isManual, setIsManual] = useState(false);

  // 賃貸フィールド
  const [rent, setRent] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [depositMonths, setDepositMonths] = useState('2');
  const [keyMoneyMonths, setKeyMoneyMonths] = useState('1');
  const [fireInsurance, setFireInsurance] = useState('20000');
  const [keyCost, setKeyCost] = useState('20000');

  // 売買フィールド
  const [propertyPrice, setPropertyPrice] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [bankFee, setBankFee] = useState('44000');
  const [fireInsuranceBuy, setFireInsuranceBuy] = useState('80000');

  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProperty(null);
  }, [tab]);

  useEffect(() => {
    if (!searchQuery.trim() || isManual) {
      setSearchResults([]);
      return;
    }
    const safe = searchQuery.trim().replace(/%/g, '').replace(/_/g, '\\_');
    const pattern = `%${safe}%`;
    const dealType = tab === 'rent' ? 'rent' : 'sale';
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, address, price, rent, management_fee, security_deposit, key_money')
        .eq('status', 'active')
        .or(`deal_type.eq.${dealType},deal_type.eq.both`)
        .or(`title.ilike.${pattern},address.ilike.${pattern}`)
        .limit(5);
      setSearchResults(data || []);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, tab, isManual]);

  const selectProperty = (prop) => {
    setSelectedProperty(prop);
    setSearchResults([]);
    setSearchQuery(prop.title || '');
    if (tab === 'rent') {
      setRent(prop.rent ? String(Math.round(prop.rent / 10000)) : '');
      setManagementFee(prop.management_fee ? String(prop.management_fee) : '');
      setDepositMonths(prop.security_deposit ? String(prop.security_deposit) : '2');
      setKeyMoneyMonths(prop.key_money ? String(prop.key_money) : '1');
    } else {
      const priceMan = prop.price ? Math.round(prop.price / 10000) : 0;
      setPropertyPrice(priceMan > 0 ? String(priceMan) : '');
      setLoanAmount(priceMan > 0 ? String(Math.round(priceMan * 0.85)) : '');
    }
  };

  // 賃貸計算
  const rentYen = (parseFloat(rent) || 0) * 10000;
  const depositYen = rentYen * (parseFloat(depositMonths) || 0);
  const keyMoneyYen = rentYen * (parseFloat(keyMoneyMonths) || 0);
  const brokerageRentYen = rentYen;
  const fireInsuranceYen = parseFloat(fireInsurance) || 0;
  const keyCostYen = parseFloat(keyCost) || 0;
  const prevRentYen = rentYen;
  const rentTotal = depositYen + keyMoneyYen + brokerageRentYen + fireInsuranceYen + keyCostYen + prevRentYen;

  // 売買計算
  const priceYen = (parseFloat(propertyPrice) || 0) * 10000;
  const loanYen = (parseFloat(loanAmount) || 0) * 10000;
  const registrationFee = priceYen * 0.006;
  const mortgageFee = loanYen * 0.004;
  const bankFeeYen = parseFloat(bankFee) || 44000;
  const guaranteeFee = loanYen * 0.015;
  const stampDuty = priceYen > 0 ? calcStampDuty(priceYen) : 0;
  const brokerageBuy = priceYen > 0 ? (priceYen * 0.03 + 60000) * 1.1 : 0;
  const fireInsuranceBuyYen = parseFloat(fireInsuranceBuy) || 80000;
  const buyTotal = registrationFee + mortgageFee + bankFeeYen + guaranteeFee + stampDuty + brokerageBuy + fireInsuranceBuyYen;

  const hasRentData = rentYen > 0;
  const hasBuyData = priceYen > 0;

  const rentBreakdown = [
    { label: '敷金', value: depositYen, note: `${depositMonths}ヶ月分` },
    { label: '礼金', value: keyMoneyYen, note: `${keyMoneyMonths}ヶ月分` },
    { label: '仲介手数料', value: brokerageRentYen, note: '賃料1ヶ月' },
    { label: '火災保険料', value: fireInsuranceYen, note: '' },
    { label: '鍵交換費用', value: keyCostYen, note: '' },
    { label: '前家賃', value: prevRentYen, note: '1ヶ月分' },
  ];

  const buyBreakdown = [
    { label: '所有権移転登記費用', value: registrationFee, note: '物件価格×0.6%' },
    { label: '抵当権設定費用', value: mortgageFee, note: '借入額×0.4%' },
    { label: '銀行事務手数料', value: bankFeeYen, note: '' },
    { label: '住宅ローン保証料', value: guaranteeFee, note: '借入額×1.5%' },
    { label: '印紙代', value: stampDuty, note: '' },
    { label: '仲介手数料', value: brokerageBuy, note: '(物件価格×3%+6万)×1.1' },
    { label: '火災保険料', value: fireInsuranceBuyYen, note: '' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: '60px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '999px',
          border: '1px solid #E5E7EB', background: 'white',
          color: '#374151', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontFamily: 'inherit',
        }}
      >
        <ChevronLeft size={16} />
        戻る
      </button>

      <div style={{ textAlign: 'center', paddingTop: '72px', marginBottom: '4px' }}>
        <img src="/logo.png" alt="House-AI" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
      </div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>諸費用計算</h1>
        <p style={{ fontSize: '13px', color: '#5C677D', margin: 0 }}>初期費用の目安をすぐに確認できます</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', gap: '8px', padding: '0 20px' }}>
        {['rent', 'buy'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              flex: 1, maxWidth: '160px',
              padding: '10px 0', borderRadius: '12px',
              border: tab === t ? `2px solid ${GOLD}` : '2px solid #E5E7EB',
              background: tab === t ? NAVY : 'white',
              color: tab === t ? '#fff' : '#374151',
              fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {t === 'rent' ? '賃貸' : '売買（住宅用）'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '0 16px' }}>

        {/* 物件検索カード */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: NAVY, margin: 0 }}>物件検索（任意）</h2>
            {isManual ? (
              <button
                type="button"
                onClick={() => { setIsManual(false); setSearchQuery(''); }}
                style={{ background: 'none', border: 'none', color: GOLD, fontSize: '12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
              >
                検索に戻る
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsManual(true)}
                style={{ background: 'none', border: 'none', color: GOLD, fontSize: '12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
              >
                手動で入力する
              </button>
            )}
          </div>

          {isManual ? (
            <p style={{ fontSize: '13px', color: '#5C677D', margin: 0 }}>下のフォームに直接入力してください。</p>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedProperty(null); }}
                onBlur={() => { setTimeout(() => setSearchResults([]), 150); }}
                placeholder="物件名・住所で検索..."
                style={FIELD_STYLE}
              />
              {searchResults.length > 0 ? (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'white', borderRadius: '12px', marginTop: '4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                }}>
                  {searchResults.map((prop) => (
                    <button
                      key={prop.id}
                      type="button"
                      onMouseDown={() => selectProperty(prop)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 14px', background: 'none', border: 'none',
                        borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: NAVY }}>{prop.title}</div>
                      {prop.address ? (
                        <div style={{ fontSize: '11px', color: '#5C677D', marginTop: '2px' }}>{prop.address}</div>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
              {selectedProperty !== null ? (
                <p style={{ fontSize: '12px', color: '#5C677D', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {`選択中: ${selectedProperty.title}。フォームに自動入力しました。値は変更可能です。`}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* 賃貸フォーム */}
        {tab === 'rent' ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: NAVY, margin: '0 0 16px' }}>入力フォーム</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={LABEL_STYLE}>月額賃料（万円）</label>
                <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="例：8.5" style={FIELD_STYLE} inputMode="decimal" />
              </div>
              <div>
                <label style={LABEL_STYLE}>管理費・共益費（円）</label>
                <input type="number" value={managementFee} onChange={(e) => setManagementFee(e.target.value)} placeholder="例：5000" style={FIELD_STYLE} inputMode="numeric" />
              </div>
              <div>
                <label style={LABEL_STYLE}>敷金（ヶ月数）</label>
                <input type="number" value={depositMonths} onChange={(e) => setDepositMonths(e.target.value)} placeholder="例：2" style={FIELD_STYLE} inputMode="decimal" />
              </div>
              <div>
                <label style={LABEL_STYLE}>礼金（ヶ月数）</label>
                <input type="number" value={keyMoneyMonths} onChange={(e) => setKeyMoneyMonths(e.target.value)} placeholder="例：1" style={FIELD_STYLE} inputMode="decimal" />
              </div>
              <div>
                <label style={LABEL_STYLE}>火災保険料（円）</label>
                <input type="number" value={fireInsurance} onChange={(e) => setFireInsurance(e.target.value)} placeholder="例：20000" style={FIELD_STYLE} inputMode="numeric" />
              </div>
              <div>
                <label style={LABEL_STYLE}>鍵交換費用（円）</label>
                <input type="number" value={keyCost} onChange={(e) => setKeyCost(e.target.value)} placeholder="例：20000" style={FIELD_STYLE} inputMode="numeric" />
              </div>
            </div>
          </div>
        ) : null}

        {/* 売買フォーム */}
        {tab === 'buy' ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: NAVY, margin: '0 0 16px' }}>入力フォーム</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={LABEL_STYLE}>物件価格（万円）</label>
                <input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value)} placeholder="例：3000" style={FIELD_STYLE} inputMode="numeric" />
              </div>
              <div>
                <label style={LABEL_STYLE}>住宅ローン借入額（万円）</label>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="例：2550" style={FIELD_STYLE} inputMode="numeric" />
              </div>
              <div>
                <label style={LABEL_STYLE}>銀行事務手数料（円）</label>
                <input type="number" value={bankFee} onChange={(e) => setBankFee(e.target.value)} placeholder="例：44000" style={FIELD_STYLE} inputMode="numeric" />
              </div>
              <div>
                <label style={LABEL_STYLE}>火災保険料（円）</label>
                <input type="number" value={fireInsuranceBuy} onChange={(e) => setFireInsuranceBuy(e.target.value)} placeholder="例：80000" style={FIELD_STYLE} inputMode="numeric" />
              </div>
            </div>
          </div>
        ) : null}

        {/* 賃貸費用内訳 */}
        {tab === 'rent' && hasRentData ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: NAVY, margin: '0 0 12px' }}>費用内訳</h2>
            {rentBreakdown.map((item) => (
              <div key={item.label} style={ROW_STYLE}>
                <div>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{item.label}</span>
                  {item.note ? (
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>{item.note}</span>
                  ) : null}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: NAVY }}>{formatYen(item.value)}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px', padding: '14px', background: '#F0F7FF', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: NAVY }}>合計（目安）</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: GOLD }}>{formatYen(rentTotal)}</span>
            </div>
          </div>
        ) : null}

        {/* 売買費用内訳 */}
        {tab === 'buy' && hasBuyData ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: NAVY, margin: '0 0 12px' }}>費用内訳</h2>
            {buyBreakdown.map((item) => (
              <div key={item.label} style={ROW_STYLE}>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{item.label}</span>
                  {item.note ? (
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px' }}>{item.note}</span>
                  ) : null}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: NAVY, flexShrink: 0 }}>{formatYen(item.value)}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px', padding: '14px', background: '#F0F7FF', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: NAVY }}>合計（目安）</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: GOLD }}>{formatYen(buyTotal)}</span>
            </div>
          </div>
        ) : null}

        {/* 免責事項 */}
        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
            こちらは概算です。将来に渡り保証するものではございません。法改正・税率・宅建業法等の変更があった場合は金額が異なります。実際に取引される場合は不動産業者・税理士などにご相談のうえ進めてください。
          </p>
        </div>
      </div>
    </div>
  );
}
