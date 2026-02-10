'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js"; 
import { useRouter } from 'next/navigation';

// 👇 1. Supabase 주소와 키를 입력하세요!
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"
const supabase = createClient(supabaseUrl, supabaseKey)

// ✅ [설정] 관리자 이메일
const ADMIN_EMAIL = "agricb83@gmail.com"; 

// 🚫 [설정] 차단할 단어 리스트
const BAD_WORDS = [
  "시발", "씨발", "병신", "개새끼", "지랄", "존나", "섹스", "미친", 
  "ㅅㅂ", "ㅂㅅ", "ㅈㄹ", "살인", "자살", "변태"
];

const containsBadWord = (text: string) => {
  return BAD_WORDS.some(word => text.includes(word));
};

// 아이콘
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

type Profile = { 
  id: string; 
  username: string; 
  sport: string; 
  position: string; 
  avatar_url?: string;
  level?: string;
  emoji?: string;
  color?: string;
};

type Comment = { 
  id: number; 
  content: string; 
  user_id: string; 
  created_at: string; 
  profile?: Profile;
  like_count: number; 
  is_liked: boolean;  
};

type Log = { 
  id: string; 
  title?: string; 
  content: string; 
  created_at: string; 
  pain_score: number; 
  user_id: string; 
  is_public: boolean; 
  image_url?: string; 
  log_type?: 'workout' | 'rehab'; 
  media_type?: 'image' | 'video'; 
  profile?: Profile; 
  like_count: number; 
  is_liked: boolean; 
  comments: Comment[]; 
};

type Notice = { id: number; title: string; content: string; created_at: string; };
type RankedUser = Profile & { logCount: number; rank: number; };

const getLevel = (count: number) => {
  if (count >= 50) return { name: 'World Class', emoji: '👑', color: 'bg-purple-600 text-white' };
  if (count >= 30) return { name: 'Pro', emoji: '🔥', color: 'bg-red-500 text-white' };
  if (count >= 10) return { name: 'Semi-Pro', emoji: '🏃', color: 'bg-blue-500 text-white' };
  return { name: 'Rookie', emoji: '🐣', color: 'bg-green-500 text-white' };
};

export default function CommunityPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [ranking, setRanking] = useState<RankedUser[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});

  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  // 🔍 검색어 상태
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data: noticesData } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (noticesData) setNotices(noticesData);

    const { data: logsData } = await supabase.from('logs').select('*').eq('is_public', true).order('created_at', { ascending: false });
    const { data: allLogs } = await supabase.from('logs').select('user_id');

    if (!logsData || !allLogs) { setLoading(false); return; }

    const counts: {[key: string]: number} = {};
    allLogs.forEach(l => { counts[l.user_id] = (counts[l.user_id] || 0) + 1; });
    
    const userIds = Array.from(new Set([...logsData.map(l => l.user_id), ...Object.keys(counts)]));
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);

    const rankedUsers: RankedUser[] = (profiles || []).map(p => {
        const count = counts[p.id] || 0;
        const lvl = getLevel(count);
        return { ...p, logCount: count, rank: 0, level: lvl.name, emoji: lvl.emoji, color: lvl.color };
    }).sort((a, b) => b.logCount - a.logCount).slice(0, 3);

    setRanking(rankedUsers);

    const logIds = logsData.map(l => l.id);
    const { data: postLikes } = await supabase.from('likes').select('*').in('log_id', logIds);
    const { data: comments } = await supabase.from('comments').select('*').in('log_id', logIds);
    
    const commentIds = comments?.map(c => c.id) || [];
    const { data: commentLikes } = await supabase.from('comment_likes').select('*').in('comment_id', commentIds);

    const commentUserIds = comments ? Array.from(new Set(comments.map(c => c.user_id))) : [];
    const { data: commentProfiles } = await supabase.from('profiles').select('*').in('id', commentUserIds);

    const combinedLogs = logsData.map(log => {
      const logLikes = postLikes?.filter(l => l.log_id === log.id) || [];
      const logComments = comments?.filter(c => c.log_id === log.id) || [];
      
      const enrichedComments = logComments.map(c => {
        const likesForThisComment = commentLikes?.filter(cl => cl.comment_id === c.id) || [];
        return { 
            ...c, 
            profile: commentProfiles?.find(p => p.id === c.user_id),
            like_count: likesForThisComment.length,
            is_liked: user ? likesForThisComment.some(cl => cl.user_id === user.id) : false
        };
      });

      enrichedComments.sort((a, b) => {
        if (b.like_count !== a.like_count) return b.like_count - a.like_count;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      const authorCount = counts[log.user_id] || 0;
      const authorLevel = getLevel(authorCount);

      return {
        ...log,
        profile: { 
            ...profiles?.find(p => p.id === log.user_id), 
            level: authorLevel.name, 
            emoji: authorLevel.emoji, 
            color: authorLevel.color 
        } as Profile, 
        like_count: logLikes.length,
        is_liked: user ? logLikes.some(l => l.user_id === user.id) : false,
        comments: enrichedComments
      };
    });

    setLogs(combinedLogs);
    setLoading(false);
  }

  const toggleLike = async (logId: string, currentLiked: boolean) => { 
    if (!currentUser) { alert('로그인 필요'); return; } 
    if (currentLiked) await supabase.from('likes').delete().match({ user_id: currentUser.id, log_id: logId }); 
    else await supabase.from('likes').insert({ user_id: currentUser.id, log_id: logId }); 
    fetchData(); 
  };

  const toggleCommentLike = async (commentId: number, currentLiked: boolean) => {
    if (!currentUser) { alert('로그인 필요'); return; }
    if (currentLiked) await supabase.from('comment_likes').delete().match({ user_id: currentUser.id, comment_id: commentId });
    else await supabase.from('comment_likes').insert({ user_id: currentUser.id, comment_id: commentId });
    fetchData(); 
  };

  const addComment = async (logId: string) => { 
    if (!currentUser) { alert('로그인 필요'); return; } 
    const content = commentInputs[logId]; 
    if (!content?.trim()) return; 
    if (containsBadWord(content)) return alert("🚫 바른 말을 사용해주세요!");
    await supabase.from('comments').insert({ content, log_id: logId, user_id: currentUser.id }); 
    setCommentInputs({ ...commentInputs, [logId]: '' }); 
    fetchData(); 
  };

  const deleteComment = async (commentId: number) => { if (!confirm('삭제하시겠습니까?')) return; await supabase.from('comments').delete().eq('id', commentId); fetchData(); };
  const toggleCommentView = (logId: string) => { setExpandedComments(prev => ({ ...prev, [logId]: !prev[logId] })); };

  const handleAddNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) return alert("내용을 입력하세요!");
    await supabase.from('notices').insert({ title: noticeTitle, content: noticeContent });
    alert("공지 등록 완료! 📢");
    setNoticeTitle(''); setNoticeContent(''); setShowNoticeForm(false);
    fetchData();
  };
  const handleDeleteNotice = async (id: number) => { if (!confirm("삭제?")) return; await supabase.from('notices').delete().eq('id', id); fetchData(); };

  // 🔍 검색 필터링
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const titleMatch = log.title?.toLowerCase().includes(term);
    const contentMatch = log.content.toLowerCase().includes(term);
    const userMatch = log.profile?.username.toLowerCase().includes(term);
    return titleMatch || contentMatch || userMatch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><p className="text-xl font-bold animate-pulse text-blue-500">로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white pb-24 selection:bg-blue-500 selection:text-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 shadow-sm transition-all duration-300">
            <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">M</div>
                <span className="text-xl font-black tracking-tight text-white">MOVEPLAZA</span>
            </div>
            <button onClick={() => router.push('/dashboard')} className="text-sm font-bold text-slate-400 hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-slate-900 transition">🏠 내 일지</button>
            </div>
        </header>

        <div className="pt-24 pb-20 px-4 md:px-8 max-w-2xl mx-auto space-y-8 animate-slide-up">
            
            <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                <div>
                    <h1 className="text-3xl font-black text-white">광장 📢</h1>
                    <p className="text-slate-400 font-bold mt-1">서로 응원하고 꿀팁을 나눠보세요!</p>
                </div>
                {currentUser?.email === ADMIN_EMAIL && (
                    <button onClick={() => setShowNoticeForm(!showNoticeForm)} className="bg-white text-slate-950 text-xs px-3 py-2 rounded-lg font-bold">📢 공지 쓰기</button>
                )}
            </div>

            {/* 🔍 검색창 (모바일 최적화 수정됨) */}
            <div className="sticky top-20 z-40">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <Icons.Search />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="관심 부위나 내용 검색 (예: 십자인대)" 
                        className="w-full pl-12 pr-10 py-4 bg-slate-900 border border-white/10 rounded-2xl text-sm md:text-base text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-lg transition-all"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                        >
                            <Icons.X />
                        </button>
                    )}
                </div>
            </div>

            {/* 공지 입력창 */}
            {currentUser?.email === ADMIN_EMAIL && showNoticeForm && (
                <div className="bg-slate-900 p-6 rounded-3xl border border-blue-500/30">
                    <h3 className="font-black text-lg mb-4 text-white">새 공지사항 작성</h3>
                    <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="공지 제목" className="w-full p-3 mb-2 bg-slate-800 rounded-xl font-bold border border-slate-700 text-white" />
                    <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="공지 내용" className="w-full p-3 mb-4 bg-slate-800 rounded-xl h-24 font-medium border border-slate-700 text-white" />
                    <button onClick={handleAddNotice} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">등록하기</button>
                </div>
            )}

            {/* 공지 리스트 (검색어 없을 때만 보임) */}
            {!searchTerm && notices.length > 0 && (
                <div className="bg-slate-900/30 p-5 rounded-3xl border border-white/5 space-y-3">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Notice</h3>
                    {notices.map((notice) => (
                        <div key={notice.id} className="bg-slate-900 p-4 rounded-xl flex flex-col gap-1 relative border border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-red-500 text-lg">📢</span>
                                <h4 className="font-bold text-white">{notice.title}</h4>
                            </div>
                            <p className="text-slate-300 text-sm pl-7 whitespace-pre-wrap">{notice.content}</p>
                            <span className="text-[10px] text-slate-500 pl-7 font-bold">{new Date(notice.created_at).toLocaleDateString()}</span>
                            {currentUser?.email === ADMIN_EMAIL && <button onClick={() => handleDeleteNotice(notice.id)} className="absolute top-4 right-4 text-xs text-slate-600 hover:text-red-500 font-bold">삭제</button>}
                        </div>
                    ))}
                </div>
            )}

            {/* 랭킹 (검색어 없을 때만 보임) */}
            {!searchTerm && ranking.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">🏆 명예의 전당 (TOP 3)</h2>
                    <div className="flex justify-around items-end gap-2">
                        {ranking[1] && (<div className="flex flex-col items-center gap-2 mb-4"><div className="w-16 h-16 rounded-full border-4 border-slate-600 overflow-hidden bg-slate-800">{ranking[1].avatar_url ? <img src={ranking[1].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}</div><div className="text-center"><span className="bg-slate-600 text-slate-200 text-[10px] font-black px-2 py-0.5 rounded-full">2ND</span><p className="font-bold text-sm mt-1">{ranking[1].username}</p><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ranking[1].color} inline-block mt-1`}>{ranking[1].emoji} {ranking[1].level}</span></div></div>)}
                        {ranking[0] && (<div className="flex flex-col items-center gap-2 z-10"><div className="text-4xl absolute -mt-10">👑</div><div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-yellow-900/20 shadow-[0_0_20px_rgba(250,204,21,0.3)]">{ranking[0].avatar_url ? <img src={ranking[0].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}</div><div className="text-center"><span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">1ST</span><p className="font-black text-lg mt-1">{ranking[0].username}</p><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ranking[0].color} inline-block mt-1`}>{ranking[0].emoji} {ranking[0].level}</span><p className="text-xs text-yellow-500/80 font-bold mt-1">{ranking[0].logCount}회 기록</p></div></div>)}
                        {ranking[2] && (<div className="flex flex-col items-center gap-2 mb-2"><div className="w-16 h-16 rounded-full border-4 border-orange-800 overflow-hidden bg-slate-800">{ranking[2].avatar_url ? <img src={ranking[2].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}</div><div className="text-center"><span className="bg-orange-800 text-orange-200 text-[10px] font-black px-2 py-0.5 rounded-full">3RD</span><p className="font-bold text-sm mt-1">{ranking[2].username}</p><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ranking[2].color} inline-block mt-1`}>{ranking[2].emoji} {ranking[2].level}</span></div></div>)}
                    </div>
                </div>
            )}

            {/* 피드 목록 (필터링된 결과) */}
            <div className="space-y-6">
            {filteredLogs.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-white/10">
                    <p className="text-4xl mb-4">🌫️</p>
                    <p className="text-slate-500 font-bold">검색 결과가 없습니다.</p>
                </div>
            ) : (
                filteredLogs.map((log) => {
                    const isExpanded = expandedComments[log.id];
                    const visibleComments = isExpanded ? log.comments : log.comments.slice(0, 3);
                    const hiddenCount = log.comments.length - 3;

                    return (
                    <div key={log.id} className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                            {log.profile?.avatar_url ? <img src={log.profile.avatar_url} alt="프사" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                            </div>
                            <div>
                            <div className="flex items-center gap-1.5">
                                <p className="font-black text-white text-lg">{log.profile?.username || '이름 없음'}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${log.profile?.color || 'bg-slate-800 text-slate-400'}`}>
                                    {log.profile?.emoji} {log.profile?.level}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 font-bold">{log.profile?.sport || '운동'} · {log.profile?.position || '미설정'}</p>
                            </div>
                            <div className="ml-auto text-sm text-slate-500 font-medium">{new Date(log.created_at).toLocaleDateString()}</div>
                        </div>

                        <div className="mb-5">
                            <div className="mb-2"> <span className={`text-[10px] px-2 py-1 rounded-md font-black tracking-wide uppercase ${log.log_type === 'workout' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}> {log.log_type === 'workout' ? 'WORKOUT' : 'REHAB'} </span> </div>
                            {log.title && <h2 className="text-xl font-bold text-white mb-2 break-all">{log.title}</h2>}
                            <p className="text-slate-300 font-medium text-lg whitespace-pre-wrap break-all mb-4">{log.content}</p>
                            {log.image_url && ( <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-sm"> {log.media_type === 'video' ? ( <video src={log.image_url} controls className="w-full h-auto" /> ) : ( <img src={log.image_url} alt="인증샷" className="w-full h-auto object-cover" /> )} </div> )}
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${log.pain_score > 5 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}> 강도 {log.pain_score}점 </div>
                            <button onClick={() => toggleLike(log.id, log.is_liked)} className={`flex items-center gap-2 font-bold text-lg transition px-4 py-2 rounded-full border ${log.is_liked ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-slate-400 hover:text-red-500 border-white/10 hover:bg-red-500/10'}`}> {log.is_liked ? '❤️' : '🤍'} {log.like_count || 0} </button>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-2xl border border-white/5">
                            <div className="space-y-3 mb-4">
                            {visibleComments.map(comment => (
                                <div key={comment.id} className="flex gap-2 items-start text-sm group">
                                    <span className="font-bold text-slate-300 shrink-0">{comment.profile?.username || '익명'}:</span>
                                    <span className="text-slate-400 font-medium break-all flex-1">{comment.content}</span>
                                    
                                    <button onClick={() => toggleCommentLike(comment.id, comment.is_liked)} className={`text-xs flex items-center gap-1 font-bold ${comment.is_liked ? 'text-red-500' : 'text-slate-600 hover:text-red-400'}`}>
                                        <span>{comment.is_liked ? '❤️' : '🤍'}</span>
                                        {comment.like_count > 0 && <span>{comment.like_count}</span>}
                                    </button>

                                    {currentUser?.id === comment.user_id && <button onClick={() => deleteComment(comment.id)} className="text-slate-600 hover:text-red-500 font-bold px-1 text-xs">✕</button>}
                                </div>
                            ))}
                            {log.comments.length === 0 && <p className="text-xs text-slate-400 font-bold">첫 댓글을 남겨보세요!</p>}
                            
                            {log.comments.length > 3 && (
                                <button 
                                    onClick={() => toggleCommentView(log.id)}
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-2 block w-full text-left"
                                >
                                    {isExpanded ? '댓글 접기 ▲' : `댓글 ${hiddenCount}개 더 보기 ▼`}
                                </button>
                            )}
                            </div>

                            <div className="flex gap-2">
                            <input type="text" value={commentInputs[log.id] || ''} onChange={(e) => setCommentInputs({...commentInputs, [log.id]: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && addComment(log.id)} placeholder="댓글 입력..." className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-slate-800 text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            <button onClick={() => addComment(log.id)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-500">등록</button>
                            </div>
                        </div>
                    </div>
                    )
                })
            )}
            </div>
        </div>
    </div>
  );
}