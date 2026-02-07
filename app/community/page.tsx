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

// 👇 [수정] 댓글 타입에 좋아요 관련 필드 추가
type Comment = { 
  id: number; 
  content: string; 
  user_id: string; 
  created_at: string; 
  profile?: Profile;
  like_count: number; // 좋아요 수
  is_liked: boolean;  // 내가 좋아요 눌렀는지
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

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // 공지사항
    const { data: noticesData } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (noticesData) setNotices(noticesData);

    // 로그 목록
    const { data: logsData } = await supabase.from('logs').select('*').eq('is_public', true).order('created_at', { ascending: false });
    const { data: allLogs } = await supabase.from('logs').select('user_id');

    if (!logsData || !allLogs) { setLoading(false); return; }

    // 유저 랭킹 계산
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

    // 로그 관련 데이터 (좋아요, 댓글, 댓글좋아요) 가져오기
    const logIds = logsData.map(l => l.id);
    const { data: postLikes } = await supabase.from('likes').select('*').in('log_id', logIds);
    const { data: comments } = await supabase.from('comments').select('*').in('log_id', logIds);
    
    // 👇 [추가] 댓글 좋아요 데이터 가져오기
    const commentIds = comments?.map(c => c.id) || [];
    const { data: commentLikes } = await supabase.from('comment_likes').select('*').in('comment_id', commentIds);

    const commentUserIds = comments ? Array.from(new Set(comments.map(c => c.user_id))) : [];
    const { data: commentProfiles } = await supabase.from('profiles').select('*').in('id', commentUserIds);

    const combinedLogs = logsData.map(log => {
      const logLikes = postLikes?.filter(l => l.log_id === log.id) || [];
      const logComments = comments?.filter(c => c.log_id === log.id) || [];
      
      const enrichedComments = logComments.map(c => {
        // 댓글 좋아요 계산
        const likesForThisComment = commentLikes?.filter(cl => cl.comment_id === c.id) || [];
        return { 
            ...c, 
            profile: commentProfiles?.find(p => p.id === c.user_id),
            like_count: likesForThisComment.length,
            is_liked: user ? likesForThisComment.some(cl => cl.user_id === user.id) : false
        };
      });

      // 👇 [정렬 로직] 좋아요 많은 순 -> 그 다음 최신순
      enrichedComments.sort((a, b) => {
        if (b.like_count !== a.like_count) {
            return b.like_count - a.like_count; // 좋아요 많은 게 위로
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // 그 다음엔 오래된 게 위로 (대화 흐름)
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

  // 게시글 좋아요
  const toggleLike = async (logId: string, currentLiked: boolean) => { 
    if (!currentUser) { alert('로그인 필요'); return; } 
    if (currentLiked) await supabase.from('likes').delete().match({ user_id: currentUser.id, log_id: logId }); 
    else await supabase.from('likes').insert({ user_id: currentUser.id, log_id: logId }); 
    fetchData(); 
  };

  // 👇 [추가] 댓글 좋아요 토글 함수
  const toggleCommentLike = async (commentId: number, currentLiked: boolean) => {
    if (!currentUser) { alert('로그인 필요'); return; }
    if (currentLiked) {
        await supabase.from('comment_likes').delete().match({ user_id: currentUser.id, comment_id: commentId });
    } else {
        await supabase.from('comment_likes').insert({ user_id: currentUser.id, comment_id: commentId });
    }
    fetchData(); // 데이터 갱신 (정렬 반영됨)
  };

  // 댓글 등록
  const addComment = async (logId: string) => { 
    if (!currentUser) { alert('로그인 필요'); return; } 
    const content = commentInputs[logId]; 
    if (!content?.trim()) return; 

    if (containsBadWord(content)) {
      return alert("🚫 댓글에 부적절한 단어가 포함되어 있습니다. 바른 말을 사용해주세요!");
    }

    await supabase.from('comments').insert({ content, log_id: logId, user_id: currentUser.id }); 
    setCommentInputs({ ...commentInputs, [logId]: '' }); 
    fetchData(); 
  };

  const deleteComment = async (commentId: number) => { if (!confirm('삭제하시겠습니까?')) return; await supabase.from('comments').delete().eq('id', commentId); fetchData(); };
  const toggleCommentView = (logId: string) => { setExpandedComments(prev => ({ ...prev, [logId]: !prev[logId] })); };

  // 공지사항 관련 함수들
  const handleAddNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) return alert("내용을 입력하세요!");
    if (containsBadWord(noticeTitle) || containsBadWord(noticeContent)) return alert("🚫 부적절한 단어가 포함되어 있습니다.");
    await supabase.from('notices').insert({ title: noticeTitle, content: noticeContent });
    alert("공지 등록 완료! 📢");
    setNoticeTitle(''); setNoticeContent(''); setShowNoticeForm(false);
    fetchData();
  };
  const handleDeleteNotice = async (id: number) => { if (!confirm("삭제?")) return; await supabase.from('notices').delete().eq('id', id); fetchData(); };


  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-bold animate-pulse text-blue-600">로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
            <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black text-lg">M</div>
                <span className="text-xl font-black tracking-tight text-slate-900">MOVEPLAZA</span>
            </div>
            <button onClick={() => router.push('/dashboard')} className="text-sm font-bold text-slate-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition">🏠 내 일지</button>
            </div>
        </header>

        <div className="pt-24 pb-20 px-4 md:px-8 max-w-2xl mx-auto space-y-8 animate-slide-up">
            
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">광장 📢</h1>
                    <p className="text-slate-500 font-bold mt-1">서로 응원하고 꿀팁을 나눠보세요!</p>
                </div>
                {currentUser?.email === ADMIN_EMAIL && (
                    <button onClick={() => setShowNoticeForm(!showNoticeForm)} className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg font-bold">📢 공지 쓰기</button>
                )}
            </div>

            {/* 공지 입력창 */}
            {currentUser?.email === ADMIN_EMAIL && showNoticeForm && (
                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-slate-900">
                    <h3 className="font-black text-lg mb-4">새 공지사항 작성</h3>
                    <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="공지 제목" className="w-full p-3 mb-2 bg-slate-50 rounded-xl font-bold border border-slate-200" />
                    <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="공지 내용" className="w-full p-3 mb-4 bg-slate-50 rounded-xl h-24 font-medium border border-slate-200" />
                    <button onClick={handleAddNotice} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">등록하기</button>
                </div>
            )}

            {/* 공지 리스트 */}
            {notices.length > 0 && (
                <div className="bg-slate-100 p-5 rounded-3xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Notice</h3>
                    {notices.map((notice) => (
                        <div key={notice.id} className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-1 relative">
                            <div className="flex items-center gap-2">
                                <span className="text-red-500 text-lg">📢</span>
                                <h4 className="font-bold text-slate-900">{notice.title}</h4>
                            </div>
                            <p className="text-slate-600 text-sm pl-7 whitespace-pre-wrap">{notice.content}</p>
                            <span className="text-[10px] text-slate-400 pl-7 font-bold">{new Date(notice.created_at).toLocaleDateString()}</span>
                            {currentUser?.email === ADMIN_EMAIL && <button onClick={() => handleDeleteNotice(notice.id)} className="absolute top-4 right-4 text-xs text-slate-300 hover:text-red-500 font-bold">삭제</button>}
                        </div>
                    ))}
                </div>
            )}

            {/* 랭킹 */}
            {ranking.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">🏆 명예의 전당 (TOP 3)</h2>
                    <div className="flex justify-around items-end gap-2">
                        {ranking[1] && (<div className="flex flex-col items-center gap-2 mb-4"><div className="w-16 h-16 rounded-full border-4 border-slate-400 overflow-hidden bg-slate-200">{ranking[1].avatar_url ? <img src={ranking[1].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}</div><div className="text-center"><span className="bg-slate-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">2ND</span><p className="font-bold text-sm mt-1">{ranking[1].username}</p><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ranking[1].color} inline-block mt-1`}>{ranking[1].emoji} {ranking[1].level}</span></div></div>)}
                        {ranking[0] && (<div className="flex flex-col items-center gap-2 z-10"><div className="text-4xl absolute -mt-10">👑</div><div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-yellow-100 shadow-lg shadow-yellow-500/30">{ranking[0].avatar_url ? <img src={ranking[0].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}</div><div className="text-center"><span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">1ST</span><p className="font-black text-lg mt-1">{ranking[0].username}</p><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ranking[0].color} inline-block mt-1`}>{ranking[0].emoji} {ranking[0].level}</span><p className="text-xs text-yellow-200 font-bold mt-1">{ranking[0].logCount}회 기록</p></div></div>)}
                        {ranking[2] && (<div className="flex flex-col items-center gap-2 mb-2"><div className="w-16 h-16 rounded-full border-4 border-orange-700 overflow-hidden bg-slate-200">{ranking[2].avatar_url ? <img src={ranking[2].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}</div><div className="text-center"><span className="bg-orange-700 text-orange-100 text-[10px] font-black px-2 py-0.5 rounded-full">3RD</span><p className="font-bold text-sm mt-1">{ranking[2].username}</p><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ranking[2].color} inline-block mt-1`}>{ranking[2].emoji} {ranking[2].level}</span></div></div>)}
                    </div>
                </div>
            )}

            {/* 피드 목록 */}
            <div className="space-y-6">
            {logs.map((log) => {
                const isExpanded = expandedComments[log.id];
                const visibleComments = isExpanded ? log.comments : log.comments.slice(0, 3);
                const hiddenCount = log.comments.length - 3;

                return (
                <div key={log.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    {log.profile?.avatar_url ? <img src={log.profile.avatar_url} alt="프사" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                    </div>
                    <div>
                    <div className="flex items-center gap-1.5">
                        <p className="font-black text-slate-900 text-lg">{log.profile?.username || '이름 없음'}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${log.profile?.color || 'bg-gray-100 text-gray-500'}`}>
                            {log.profile?.emoji} {log.profile?.level}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 font-bold">{log.profile?.sport || '운동'} · {log.profile?.position || '미설정'}</p>
                    </div>
                    <div className="ml-auto text-sm text-slate-400 font-medium">{new Date(log.created_at).toLocaleDateString()}</div>
                </div>

                <div className="mb-5">
                    <div className="mb-2"> <span className={`text-[10px] px-2 py-1 rounded-md font-black tracking-wide uppercase ${log.log_type === 'workout' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}> {log.log_type === 'workout' ? 'WORKOUT' : 'REHAB'} </span> </div>
                    {log.title && <h2 className="text-xl font-bold text-slate-900 mb-2 break-all">{log.title}</h2>}
                    <p className="text-slate-700 font-medium text-lg whitespace-pre-wrap break-all mb-4">{log.content}</p>
                    {log.image_url && ( <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 shadow-sm"> {log.media_type === 'video' ? ( <video src={log.image_url} controls className="w-full h-auto" /> ) : ( <img src={log.image_url} alt="인증샷" className="w-full h-auto object-cover" /> )} </div> )}
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold ${log.pain_score > 5 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}> 강도 {log.pain_score}점 </div>
                    <button onClick={() => toggleLike(log.id, log.is_liked)} className={`flex items-center gap-2 font-bold text-lg transition px-4 py-2 rounded-full border ${log.is_liked ? 'text-red-500 bg-red-50 border-red-200' : 'text-slate-400 hover:text-red-500 border-slate-200 hover:bg-red-50'}`}> {log.is_liked ? '❤️' : '🤍'} {log.like_count || 0} </button>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="space-y-3 mb-4">
                    {visibleComments.map(comment => (
                        <div key={comment.id} className="flex gap-2 items-start text-sm group">
                            <span className="font-bold text-slate-900 shrink-0">{comment.profile?.username || '익명'}:</span>
                            <span className="text-slate-600 font-medium break-all flex-1">{comment.content}</span>
                            
                            {/* 👇 [추가] 댓글 좋아요 버튼 */}
                            <button onClick={() => toggleCommentLike(comment.id, comment.is_liked)} className={`text-xs flex items-center gap-1 font-bold ${comment.is_liked ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}>
                                <span>{comment.is_liked ? '❤️' : '🤍'}</span>
                                {comment.like_count > 0 && <span>{comment.like_count}</span>}
                            </button>

                            {currentUser?.id === comment.user_id && <button onClick={() => deleteComment(comment.id)} className="text-slate-300 hover:text-red-500 font-bold px-1 text-xs">✕</button>}
                        </div>
                    ))}
                    {log.comments.length === 0 && <p className="text-xs text-slate-400 font-bold opacity-50">첫 댓글을 남겨보세요!</p>}
                    
                    {log.comments.length > 3 && (
                        <button 
                            onClick={() => toggleCommentView(log.id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 mt-2 block w-full text-left"
                        >
                            {isExpanded ? '댓글 접기 ▲' : `댓글 ${hiddenCount}개 더 보기 ▼`}
                        </button>
                    )}
                    </div>

                    <div className="flex gap-2">
                    <input type="text" value={commentInputs[log.id] || ''} onChange={(e) => setCommentInputs({...commentInputs, [log.id]: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && addComment(log.id)} placeholder="댓글 입력..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm" />
                    <button onClick={() => addComment(log.id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800">등록</button>
                    </div>
                </div>
                </div>
            )})}
            </div>
        </div>
    </div>
  );
}