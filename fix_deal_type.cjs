const fs = require('fs');

// ① AdminDashboard.jsx の物件登録フォームに deal_type を追加
let admin = fs.readFileSync('src/AdminDashboard.jsx', 'utf8');

// formの初期値にdeal_typeを追加
admin = admin.replace(
  `title: '', property_type: '', price: '', rent: '',
    address: '', area: '', layout: '', built_year: '',
    description: '', features: '', status: 'active'`,
  `title: '', property_type: '', deal_type: 'rent', price: '', rent: '',
    address: '', area: '', layout: '', built_year: '',
    description: '', features: '', status: 'active'`
);

// payloadにdeal_typeを追加
admin = admin.replace(
  `      features: form.features || null,
      status: form.status,`,
  `      features: form.features || null,
      deal_type: form.deal_type || 'rent',
      status: form.status,`
);

// 物件名の入力欄の前に取引種別を追加
admin = admin.replace(
  `            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件名 *</label>
              <input style={fieldStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例：大宮駅徒歩5分 2LDKマンション" />
            </div>`,
  `            <div>
              <label style={labelStyle}>取引種別 *</label>
              <select style={fieldStyle} value={form.deal_type} onChange={e => setForm(f => ({ ...f, deal_type: e.target.value }))}>
                <option value="rent">賃貸</option>
                <option value="sale">売買</option>
                <option value="both">賃貸・売買両方</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>ステータス</label>
              <select style={fieldStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">公開中</option>
                <option value="inactive">非公開</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件名 *</label>
              <input style={fieldStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例：大宮駅徒歩5分 2LDKマンション" />
            </div>`
);

// 物件カードに取引種別バッジを追加
admin = admin.replace(
  `              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>`,
  `              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: p.deal_type === 'sale' ? '#fef3c7' : p.deal_type === 'both' ? '#ede9fe' : '#dbeafe', color: p.deal_type === 'sale' ? '#92400e' : p.deal_type === 'both' ? '#5b21b6' : '#1e40af', fontWeight: 700 }}>
                  {p.deal_type === 'sale' ? '売買' : p.deal_type === 'both' ? '賃貸・売買' : '賃貸'}
                </span>
              </div>`
);

fs.writeFileSync('src/AdminDashboard.jsx', admin, 'utf8');
console.log('SUCCESS: AdminDashboard.jsx に取引種別を追加しました');

// ② PropertyMatching.jsx に取引種別フィルターを追加
let pm = fs.readFileSync('src/PropertyMatching.jsx', 'utf8');

// 検索条件にdeal_typeを追加
pm = pm.replace(
  `  const [conditions, setConditions] = useState({
    area: '',
    maxRent: '',
    maxPrice: '',
    layout: '',
    propertyType: '',
    other: '',
  })`,
  `  const [conditions, setConditions] = useState({
    area: '',
    dealType: '',
    maxRent: '',
    maxPrice: '',
    layout: '',
    propertyType: '',
    other: '',
  })`
);

// 検索クエリにdeal_typeフィルターを追加
pm = pm.replace(
  `      if (conditions.layout && conditions.layout !== 'こだわらない') {`,
  `      if (conditions.dealType) {
        query = query.eq('deal_type', conditions.dealType)
      }
      if (conditions.layout && conditions.layout !== 'こだわらない') {`
);

// UIに取引種別の選択を追加
pm = pm.replace(
  `          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>エリア・地域 <span style={{ color: '#e53e3e' }}>*</span></label>
                <input style={fieldStyle} value={conditions.area} onChange={e => setConditions(c => ({ ...c, area: e.target.value }))} placeholder="例：さいたま市大宮区" />
              </div>
              <div>
                <label style={labelStyle}>物件種別</label>
                <select style={fieldStyle} value={conditions.propertyType} onChange={e => setConditions(c => ({ ...c, propertyType: e.target.value }))}>
                  <option value="">選択してください</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>`,
  `          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>エリア・地域 <span style={{ color: '#e53e3e' }}>*</span></label>
                <input style={fieldStyle} value={conditions.area} onChange={e => setConditions(c => ({ ...c, area: e.target.value }))} placeholder="例：さいたま市大宮区" />
              </div>
              <div>
                <label style={labelStyle}>取引種別</label>
                <select style={fieldStyle} value={conditions.dealType} onChange={e => setConditions(c => ({ ...c, dealType: e.target.value }))}>
                  <option value="">すべて（賃貸・売買）</option>
                  <option value="rent">賃貸</option>
                  <option value="sale">売買</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>物件種別</label>
                <select style={fieldStyle} value={conditions.propertyType} onChange={e => setConditions(c => ({ ...c, propertyType: e.target.value }))}>
                  <option value="">選択してください</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>`
);

// 物件カードに取引種別バッジを追加
pm = pm.replace(
  `          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c', marginBottom: 6 }}>{p.title}</div>`,
  `          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>
            {p.deal_type && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: p.deal_type === 'sale' ? '#fef3c7' : p.deal_type === 'both' ? '#ede9fe' : '#dbeafe', color: p.deal_type === 'sale' ? '#92400e' : p.deal_type === 'both' ? '#5b21b6' : '#1e40af', fontWeight: 700 }}>
              {p.deal_type === 'sale' ? '売買' : p.deal_type === 'both' ? '賃貸・売買' : '賃貸'}
            </span>}
          </div>`
);

fs.writeFileSync('src/PropertyMatching.jsx', pm, 'utf8');
console.log('SUCCESS: PropertyMatching.jsx に取引種別フィルターを追加しました');
console.log('SUCCESS: 完了！');
