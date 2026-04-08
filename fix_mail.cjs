const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\Users\\ginte\\Desktop\\house-ai\\src\\App.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 売主査定
code = code.replace(
  `      const { error } = await supabase.from('valuations').insert(payload)
      if (error) throw error

      setSell((s) => ({ ...s, step: 'done' }))`,
  `      const { error } = await supabase.from('valuations').insert(payload)
      if (error) throw error

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'valuation', data: payload }),
      })

      setSell((s) => ({ ...s, step: 'done' }))`
);

// オーナー
code = code.replace(
  `      const { error } = await supabase.from('owner_requests').insert(payload)
      if (error) throw error

      setOwnerForm((o) => ({ ...o, step: 'done' }))`,
  `      const { error } = await supabase.from('owner_requests').insert(payload)
      if (error) throw error

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'owner', data: payload }),
      })

      setOwnerForm((o) => ({ ...o, step: 'done' }))`
);

// 専門家
code = code.replace(
  `      const { error } = await supabase.from('expert_requests').insert(payload)
      if (error) throw error

      setExpert((x) => ({ ...x, step: 'done' }))`,
  `      const { error } = await supabase.from('expert_requests').insert(payload)
      if (error) throw error

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'expert', data: payload }),
      })

      setExpert((x) => ({ ...x, step: 'done' }))`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('SUCCESS');