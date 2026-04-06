const fs = require('fs')

let content = fs.readFileSync('src/App.jsx', 'utf-8')

const idx = content.indexOf('const toggleEmpathy')
let end = content.indexOf('\n  }', idx)
end = content.indexOf('\n  }', end + 1) + 4

const insertCode = `

  const submitPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return
    const payload = {
      category: newPost.category,
      title: newPost.title,
      body: newPost.body,
      anon: newPost.anon,
      author_name: newPost.anon ? null : newPost.authorName,
      likes: 0,
      empathy: 0,
    }
    const { data, error } = await supabase.from('community_posts').insert(payload).select()
    if (error) { console.error(error); return }
    setPosts((list) => [{ ...data[0], likedByMe: false, empathyByMe: false, comments: [] }, ...list])
    setNewPost({ category: 'buy', title: '', body: '', anon: false, authorName: '' })
  }

  const loadPosts = async () => {
    const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false })
    if (error) { console.error(error); return }
    setPosts((data || []).map((p) => ({ ...p, likedByMe: false, empathyByMe: false, comments: [] })))
  }`

content = content.slice(0, end) + insertCode + content.slice(end)
fs.writeFileSync('src/App.jsx', content, 'utf-8')
console.log('SUCCESS')