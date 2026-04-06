const fs = require('fs')

let content = fs.readFileSync('src/App.jsx', 'utf-8')

// addPost関数をsupabase保存版に置き換え
const oldFunc = `  const addPost = () => {
    const title = communityDraft.title.trim()
    const body = communityDraft.body.trim()
    if (!title || !body) return
    const post = {
      id: uid(),
      title,`

const newFunc = `  const addPost = async () => {
    const title = communityDraft.title.trim()
    const body = communityDraft.body.trim()
    if (!title || !body) return
    const payload = {
      category: communityDraft.category || 'other',
      title,
      body,
      anon: communityDraft.anon || false,
      author_name: communityDraft.anon ? null : (communityDraft.author || null),
      likes: 0,
      empathy: 0,
    }
    const { data, error } = await supabase.from('community_posts').insert(payload).select()
    if (error) { console.error(error); return }
    const post = {
      ...data[0],
      id: data[0].id,
      title: data[0].title,`

if (content.includes(oldFunc)) {
  content = content.replace(oldFunc, newFunc)
  fs.writeFileSync('src/App.jsx', content, 'utf-8')
  console.log('SUCCESS')
} else {
  console.log('NOT FOUND')
}