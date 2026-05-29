import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MessageSquare, Clock, Eye, Heart } from 'lucide-react';
import StatsCounter from './StatsCounter';
import StatusBadge from './StatusBadge';
import { supabase } from './supabaseClient';

const mockPosts = [
  { id:'1', title:'渋谷で在宅ワーク向き物件探しています', budget:'30万円以下', area:['渋谷区','恵比寿'], postedAt:'3時間前', proposalCount:5, viewCount:183, favoriteCount:24, status:'提案あり' },
  { id:'2', title:'ペット可のファミリー向けマンション', budget:'25万円前後', area:['世田谷区'], postedAt:'5時間前', proposalCount:3, viewCount:97, favoriteCount:12, status:'募集中' },
  { id:'3', title:'新宿駅徒歩5分以内で静かな環境', budget:'35万円以下', area:['新宿区'], postedAt:'1日前', proposalCount:8, viewCount:245, favoriteCount:31, status:'提案あり' },
  { id:'4', title:'恵比寿エリアでデザイナーズマンション', budget:'28万円前後', area:['渋谷区','恵比寿'], postedAt:'4日前', proposalCount:12, viewCount:421, favoriteCount:58, status:'成約済み', daysToClose:4, dealMessage:'投稿から4日で理想の住まいが見つかりました' },
];

export default function CommunityListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(mockPosts);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (!error && data && data.length > 0) {
          const mapped = data.map(p => ({
            id: p.id,
            title: p.free_text || p.ai_summary || '希望条件の相談',
            budget: p.budget_max ? `${Math.round(p.budget_max/10000)}万円以下` : p.budget_min ? `${Math.round(p.budget_min/10000)}万円以上` : '予算未設定',
            area: p.areas || [],
            postedAt: p.created_at ? (() => {
              const diff = Date.now() - new Date(p.created_at).getTime();
              const h = Math.floor(diff/3600000);
              const d = Math.floor(diff/86400000);
              return d > 0 ? `${d}日前` : h > 0 ? `${h}時間前` : 'たった今';
            })() : '',
            proposalCount: p.proposal_count || 0,
            viewCount: 0,
            favoriteCount: 0,
            status: p.status || '募集中',
            dealMessage: null,
          }));
          setPosts(mapped);
        }
      } catch (e) { /* fallback to mock */ }
    };
    fetchPosts();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingBottom: 80 }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,10,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 896, margin: '0 auto', padding: '24px 16px 32px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button onClick={() => { window.location.href = '/'; }} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>ホーム</button>
            <button onClick={() => navigate(-1)} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>← 前のページ</button>
            <button onClick={() => { window.location.href = '/tools'; }} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>便利ツール</button>
          </div>
          <h1 style={{ fontSize: 28, color: '#fff', marginBottom: 12 }}>あなたの希望を投稿してください</h1>
          <p style={{ fontSize: 16, color: '#d1d5db', marginBottom: 8 }}>AIが条件を整理し、条件に合う業者や非公開物件情報との出会いをサポートします</p>
          <p style={{ fontSize: 14, color: '#22d3ee', fontStyle: 'italic' }}>検索する時代から、AIに探してもらう時代へ</p>
        </div>
      </div>
      <div style={{ maxWidth: 896, margin: '0 auto', padding: '32px 16px' }}>
        <StatsCounter totalPosts={137} totalProposals={91} totalDeals={26} showStats={true} />
        <button
          onClick={() => navigate('/community/create')}
          style={{ width: '100%', marginBottom: 32, background: 'linear-gradient(90deg,#eab308,#ca8a04)', color: '#000', border: 'none', borderRadius: 8, height: 56, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          新しい相談を投稿する →
        </button>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>最近の相談投稿</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map(post => (
            <div key={post.id}
              onClick={() => navigate(`/community/post/${post.id}`)}
              style={{ background: '#1a1a24', border: post.status === '成約済み' ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <StatusBadge status={post.status} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#6b7280' }}>
                  <Clock size={16} /><span>{post.postedAt}</span>
                </div>
              </div>
              <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 16 }}>{post.title}</h3>
              {post.status === '成約済み' && post.dealMessage ? (
                <div style={{ marginBottom: 16, padding: 12, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8 }}>
                  <p style={{ fontSize: 14, color: '#c084fc' }}>{post.dealMessage}</p>
                </div>
              ) : null}
              <div style={{ marginBottom: 16 }}>
                {post.area.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>
                    <MapPin size={16} /><span>{post.area.join('、')}</span>
                  </div>
                ) : null}
                <div style={{ fontSize: 14, color: '#9ca3af' }}>予算: {post.budget}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80' }}>
                  <MessageSquare size={16} /><span>提案{post.proposalCount}件</span>
                </div>
                {post.viewCount > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280' }}>
                    <Eye size={16} /><span>閲覧{post.viewCount}回</span>
                  </div>
                ) : null}
                {post.favoriteCount > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280' }}>
                    <Heart size={16} /><span>保存{post.favoriteCount}件</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
