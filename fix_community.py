import re

with open('src/App.jsx', encoding='utf-8') as f:
    content = f.read()

idx = content.find('const toggleEmpathy')
end = content.find('\n  }', idx)
end = content.find('\n  }', end + 1) + 4

insert_code = '''

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
  }'''

content = content[:end] + insert_code + content[end:]

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('SUCCESS')