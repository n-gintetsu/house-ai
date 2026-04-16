const fs = require('fs');
const path = require('path');

// 現在のApp.jsxをバックアップ
const appPath = path.join(__dirname, 'src', 'App.jsx');
const backupPath = path.join(__dirname, 'src', 'App.jsx.backup');

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(appPath, backupPath);
  console.log('✓ App.jsxをバックアップしました（App.jsx.backup）');
} else {
  console.log('✓ バックアップは既に存在します');
}

// メンテナンス画面のApp.jsxを作成
const maintenanceApp = `export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Noto Sans JP', sans-serif",
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🏠</div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#1a3a5c',
          marginBottom: 12,
          lineHeight: 1.5,
        }}>
          ただいまメンテナンス中です
        </h1>
        <p style={{
          fontSize: 14,
          color: '#666',
          lineHeight: 1.8,
          marginBottom: 24,
        }}>
          サービス向上のため、現在メンテナンス作業を行っております。<br />
          ご不便をおかけして大変申し訳ございません。<br />
          しばらくしてから再度アクセスしてください。
        </p>
        <div style={{
          background: '#f0f4f8',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>お問い合わせ</div>
          <div style={{ fontSize: 14, color: '#1a3a5c', fontWeight: 700 }}>
            GINTETSU不動産株式会社
          </div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
            📞 048-606-4317
          </div>
          <div style={{ fontSize: 13, color: '#555' }}>
            ✉️ info@gintetsu-fudosan.co.jp
          </div>
        </div>
        <div style={{
          fontSize: 11,
          color: '#c9a84c',
          fontWeight: 700,
          letterSpacing: 1,
        }}>
          GINTETSU不動産株式会社
        </div>
      </div>
    </div>
  )
}
`;

fs.writeFileSync(appPath, maintenanceApp, 'utf8');
console.log('✓ メンテナンス画面をApp.jsxに設定しました');
console.log('SUCCESS: メンテナンスモードの準備完了！');
console.log('');
console.log('※ 元に戻す場合は restore_app.cjs を実行してください');
