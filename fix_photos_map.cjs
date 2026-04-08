const fs = require('fs');

// ① AdminDashboard.jsx に写真アップロード機能を追加
let admin = fs.readFileSync('src/AdminDashboard.jsx', 'utf8');

// formの初期値にimage_urlを追加
admin = admin.replace(
  `title: '', property_type: '', deal_type: 'rent', price: '', rent: '',
    address: '', area: '', layout: '', built_year: '',
    description: '', features: '', status: 'active'`,
  `title: '', property_type: '', deal_type: 'rent', price: '', rent: '',
    address: '', area: '', layout: '', built_year: '',
    description: '', features: '', status: 'active', image_url: ''`
);

// payloadにimage_urlを追加
admin = admin.replace(
  `      deal_type: form.deal_type || 'rent',
      status: form.status,`,
  `      deal_type: form.deal_type || 'rent',
      status: form.status,
      image_url: form.image_url || null,`
);

// 写真アップロードUIを住所の後に追加
admin = admin.replace(
  `            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件説明</label>`,
  `            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件写真</label>
              <ImageUploader
                supabase={supabase}
                onUploaded={url => setForm(f => ({ ...f, image_url: url }))}
                currentUrl={form.image_url}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件説明</label>`
);

// 物件カードに写真を表示
admin = admin.replace(
  `        <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1 }}>`,
  `        <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1 }}>`
);

// ImageUploaderコンポーネントをPropertiesPanelの前に追加
admin = admin.replace(
  `const PROPERTY_TYPES_ADMIN`,
  `function ImageUploader({ supabase, onUploaded, currentUrl }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = \`property_\${Date.now()}.\${ext}\`
      const { error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('property-images').getPublicUrl(fileName)
      setPreview(data.publicUrl)
      onUploaded(data.publicUrl)
    } catch (err) {
      alert('アップロードに失敗しました: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {preview && <img src={preview} alt="プレビュー" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />}
      <label style={{ display: 'inline-block', padding: '8px 16px', background: uploading ? '#94a3b8' : '#1a3a5c', color: '#fff', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13 }}>
        {uploading ? 'アップロード中...' : '📷 写真を選択'}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
      </label>
    </div>
  )
}

const PROPERTY_TYPES_ADMIN`
);

fs.writeFileSync('src/AdminDashboard.jsx', admin, 'utf8');
console.log('SUCCESS: AdminDashboard.jsx に写真アップロード機能を追加しました');

// ② PropertyMatching.jsx に写真と地図を追加
let pm = fs.readFileSync('src/PropertyMatching.jsx', 'utf8');

// PropertyCardに写真と地図を追加
pm = pm.replace(
  `function PropertyCard({ property: p, isFavorite, onToggleFavorite }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, border: '1px solid rgba(26,58,92,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>`,
  `function PropertyCard({ property: p, isFavorite, onToggleFavorite }) {
  const [showMap, setShowMap] = useState(false)
  const mapUrl = p.address ? \`https://www.openstreetmap.org/export/embed.html?bbox=\${encodeURIComponent(p.address)}&layer=mapnik&marker=\${encodeURIComponent(p.address)}\` : ''
  const searchUrl = p.address ? \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(p.address)}\` : ''

  return (
    <div style={{ background: '#fff', borderRadius: 14, marginBottom: 12, border: '1px solid rgba(26,58,92,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />}
      <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>`
);

// PropertyCardの閉じタグを修正（地図ボタンと地図表示を追加）
pm = pm.replace(
  `          {p.description && <div style={{ fontSize: 12, color: '#777', marginTop: 6, lineHeight: 1.5 }}>{p.description}</div>}
        </div>
        <button
          onClick={() => onToggleFavorite(p.id)}
          style={{ marginLeft: 12, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          title={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  )
}`,
  `          {p.description && <div style={{ fontSize: 12, color: '#777', marginTop: 6, lineHeight: 1.5 }}>{p.description}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {p.address && (
              <button onClick={() => setShowMap(!showMap)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(26,58,92,0.2)', background: showMap ? '#1a3a5c' : '#f8fafc', color: showMap ? '#fff' : '#555', cursor: 'pointer' }}>
                🗺️ {showMap ? '地図を閉じる' : '地図を見る'}
              </button>
            )}
            {p.address && (
              <a href={searchUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(26,58,92,0.2)', background: '#f8fafc', color: '#555', textDecoration: 'none' }}>
                📍 Google Mapsで開く
              </a>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(p.id)}
          style={{ marginLeft: 12, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          title={isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      {showMap && p.address && (
        <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(26,58,92,0.1)' }}>
          <iframe
            title={p.title}
            width="100%"
            height="250"
            frameBorder="0"
            scrolling="no"
            src={\`https://maps.google.com/maps?q=\${encodeURIComponent(p.address)}&t=m&z=15&output=embed&iwloc=near\`}
            style={{ display: 'block' }}
          />
        </div>
      )}
      </div>
    </div>
  )
}`
);

// useStateのimportを確認
if (!pm.includes('useState')) {
  pm = pm.replace("import { useState, useEffect }", "import { useState, useEffect }");
}

fs.writeFileSync('src/PropertyMatching.jsx', pm, 'utf8');
console.log('SUCCESS: PropertyMatching.jsx に写真・地図機能を追加しました');

// ③ Supabaseのpropertiesテーブルにimage_urlカラム追加のSQLを出力
console.log('\n--- Supabase SQL Editor で以下を実行してください ---');
console.log('alter table properties add column if not exists image_url text;');
console.log('---------------------------------------------------\n');
console.log('SUCCESS: 完了！');
