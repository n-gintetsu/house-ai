const fs = require('fs');

let content = fs.readFileSync('src/AdminDashboard.jsx', 'utf8');

// supabaseのimportをservice_role対応に変更
const oldImport = `import { supabase } from './lib/supabase'`;
const newImport = `import { supabase } from './lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)`;

content = content.replace(oldImport, newImport);

// 会員管理タブの中身を差し替え
const oldMembers = `          {/* 会員管理（将来対応） */}
          {tab === 'members' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>👤 会員管理</h2>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
                <p style={{ color: '#777', fontSize: 14 }}>会員一覧はSupabase Authと連携して表示されます。<br />現在登録されている会員はSupabaseの「Authentication → Users」からご確認ください。</p>
                <a href="https://supabase.com/dashboard/project/bbkjnetmdfdrzcedmbdn/auth/users" target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                  Supabaseで会員を確認 →
                </a>
              </div>
            </div>
          )}`;

const newMembers = `          {/* 会員管理 */}
          {tab === 'members' && (
            <MembersPanel supabaseAdmin={supabaseAdmin} />
          )}`;

content = content.replace(oldMembers, newMembers);

// MembersPanelコンポーネントをファイル末尾のexport前に追加
const membersPanelCode = `
function MembersPanel({ supabaseAdmin }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) throw error
        setMembers(data.users || [])
      } catch (err) {
        setError('会員一覧の取得に失敗しました: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleDeleteUser(id, email) {
    if (!window.confirm(\`\${email} を削除しますか？この操作は取り消せません。\`)) return
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) { alert('削除に失敗しました: ' + error.message); return }
    setMembers(list => list.filter(m => m.id !== id))
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#777' }}>読み込み中...</div>

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>👤 会員管理（{members.length}件）</h2>
      {error && <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fee2e2', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {members.length === 0 ? <p style={{ color: '#777' }}>会員はいません</p> : members.map(m => (
        <div key={m.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{m.user_metadata?.name || '（名前未設定）'}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>✉️ {m.email}</div>
              <div style={{ fontSize: 13, color: '#555' }}>種別：{m.user_metadata?.user_type === 'agency' ? '業者・企業会員' : '一般会員'}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, display: 'flex', gap: 12 }}>
                <span>登録：{m.created_at ? new Date(m.created_at).toLocaleString('ja-JP') : ''}</span>
                <span>最終ログイン：{m.last_sign_in_at ? new Date(m.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: m.email_confirmed_at ? '#dcfce7' : '#fef9c3',
                color: m.email_confirmed_at ? '#16a34a' : '#92400e'
              }}>
                {m.email_confirmed_at ? '✅ 認証済' : '⏳ 未認証'}
              </span>
              <button onClick={() => handleDeleteUser(m.id, m.email)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

`;

// export default の前に挿入
content = content.replace('export default function AdminDashboard()', membersPanelCode + 'export default function AdminDashboard()');

fs.writeFileSync('src/AdminDashboard.jsx', content, 'utf8');
console.log('SUCCESS: AdminDashboard.jsx に会員管理機能を追加しました');
