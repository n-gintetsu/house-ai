const fs = require('fs')
const path = require('path')

const pmPath = path.join(__dirname, 'src', 'PropertyMatching.jsx')
let content = fs.readFileSync(pmPath, 'utf8')

const oldPhotoSection = `        <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f4f8', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
          {p.image_url ? <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🏠</div>}
        </div>`

const newPhotoSection = `        <PhotoSlider images={[...(p.image_urls || []), ...(p.image_url ? [p.image_url] : [])].filter((v,i,a) => a.indexOf(v) === i)} title={p.title} />`

if (content.includes(oldPhotoSection)) {
  content = content.replace(oldPhotoSection, newPhotoSection)
  console.log('OK1: モーダル写真をスライダーに変更')
} else {
  console.log('SKIP1: already replaced or not found')
}

const photoSlider = `
function PhotoSlider({ images, title }) {
  const [idx, setIdx] = useState(0)
  const imgs = images && images.length > 0 ? images : []
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length) }
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length) }
  if (imgs.length === 0) {
    return <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f4f8', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🏠</div>
  }
  return (
    <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f4f8', borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative' }}>
      <img src={imgs[idx]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }} />
      {imgs.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'<'}</button>
          <button onClick={next} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'>'}</button>
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, maxWidth: '80%', flexWrap: 'wrap', justifyContent: 'center' }}>
            {imgs.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setIdx(i) }} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, background: i === idx ? '#f5a623' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 10 }}>{idx + 1} / {imgs.length}</div>
        </>
      )}
    </div>
  )
}

`

if (!content.includes('function PhotoSlider(')) {
  content = content.replace('function PropertyCard({', photoSlider + 'function PropertyCard({')
  console.log('OK2: PhotoSliderコンポーネント追加')
} else {
  console.log('SKIP2: PhotoSlider already exists')
}

fs.writeFileSync(pmPath, content, 'utf8')
console.log('OK: PropertyMatching.jsx 更新完了')

// AgencyDashboard.jsx に複数写真アップロード（最大20枚）を追加
const agPath = path.join(__dirname, 'src', 'AgencyDashboard.jsx')
let agContent = fs.readFileSync(agPath, 'utf8')

const multiUploader = `
function MultiImageUploader({ onUploaded, currentUrls = [] }) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState(currentUrls)
  const MAX = 20

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    if (previews.length + files.length > MAX) {
      alert('写真は最大' + MAX + '枚までです')
      return
    }
    setUploading(true)
    try {
      const newUrls = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const fileName = 'agency_' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext
        const { error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName)
        newUrls.push(data.publicUrl)
      }
      const updated = [...previews, ...newUrls]
      setPreviews(updated)
      onUploaded(updated)
    } catch (err) {
      alert('アップロードに失敗しました: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  function removeImage(idx) {
    const updated = previews.filter((_, i) => i !== idx)
    setPreviews(updated)
    onUploaded(updated)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {previews.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: 72, height: 54 }}>
            <img src={url} alt={'写真' + (i+1)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
            <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(26,58,92,0.7)', color: '#fff', fontSize: 9, textAlign: 'center', borderRadius: '0 0 6px 6px' }}>メイン</div>}
          </div>
        ))}
        {previews.length < MAX && (
          <label style={{ width: 72, height: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: uploading ? '#f1f5f9' : '#eef2f7', borderRadius: 6, border: '2px dashed #cbd5e1', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 10, color: '#64748b', gap: 2 }}>
            {uploading ? '...' : '+'}
            <span style={{ fontSize: 9 }}>{uploading ? 'UP中' : '追加'}</span>
            <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} disabled={uploading} />
          </label>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#999' }}>最大{MAX}枚・1枚目がメイン写真になります</div>
    </div>
  )
}

`

if (!agContent.includes('function MultiImageUploader(')) {
  const marker = 'function ImageUploader({'
  if (agContent.includes(marker)) {
    agContent = agContent.replace(marker, multiUploader + marker)
    console.log('OK3: MultiImageUploader追加')
  } else {
    console.log('SKIP3: ImageUploader not found')
  }
} else {
  console.log('SKIP3: MultiImageUploader already exists')
}

// フォームの写真アップロードをMultiImageUploaderに変更
const patterns = [
  [`<label style={labelStyle}>物件写真</label>\n              <ImageUploader\n                onUploaded={url => setForm(f => ({ ...f, image_url: url }))}\n                currentUrl={form.image_url}\n              />`,
   `<label style={labelStyle}>物件写真（最大20枚）</label>\n              <MultiImageUploader\n                onUploaded={urls => setForm(f => ({ ...f, image_url: urls[0] || '', image_urls: urls }))}\n                currentUrls={form.image_urls || (form.image_url ? [form.image_url] : [])}\n              />`],
  [`<label style={labelStyle}>物件写真</label>\n              <ImageUploader onUploaded={url => setForm(f => ({ ...f, image_url: url }))} currentUrl={form.image_url} />`,
   `<label style={labelStyle}>物件写真（最大20枚）</label>\n              <MultiImageUploader onUploaded={urls => setForm(f => ({ ...f, image_url: urls[0] || '', image_urls: urls }))} currentUrls={form.image_urls || (form.image_url ? [form.image_url] : [])} />`],
]
let replaced = false
for (const [oldStr, newStr] of patterns) {
  if (agContent.includes(oldStr)) {
    agContent = agContent.replace(oldStr, newStr)
    console.log('OK4: 写真アップロードUIを変更')
    replaced = true
    break
  }
}
if (!replaced) console.log('SKIP4: photo uploader pattern not found')

// handleSubmitにimage_urlsを追加
if (agContent.includes('image_url: form.image_url || null,') && !agContent.includes('image_urls:')) {
  agContent = agContent.replace(
    'image_url: form.image_url || null,',
    'image_url: form.image_url || null,\n      image_urls: form.image_urls || (form.image_url ? [form.image_url] : []),'
  )
  console.log('OK5: handleSubmitにimage_urls追加')
}

// initFormにimage_urlsを追加
if (agContent.includes("image_url: '', is_public: true,") && !agContent.includes("image_urls: [],")) {
  agContent = agContent.replace(
    "image_url: '', is_public: true,",
    "image_url: '', image_urls: [], is_public: true,"
  )
  console.log('OK6: initFormにimage_urls追加')
}

fs.writeFileSync(agPath, agContent, 'utf8')
console.log('OK: AgencyDashboard.jsx 更新完了')
console.log('\nSUCCESS: 写真スライダー（最大20枚）実装完了！npm run build を実行してください')
