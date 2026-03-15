'use client';

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from "@supabase/ssr"; 
import { useRouter } from 'next/navigation';

const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

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

const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  HeartOutline: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform active:scale-75 hover:stroke-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  HeartFilled: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform active:scale-75 animate-bounce-slow"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Comment: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:stroke-blue-400 transition-colors"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  More: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:stroke-blue-400 transition-colors"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  // 🚨 신고 아이콘 추가!
  Flag: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
}

type Profile = { id: string; username: string; sport: string; position: string; avatar_url?: string; level?: string; emoji?: string; color?: string; };
type Comment = { id: number; content: string; user_id: string; created_at: string; profile?: Profile; like_count: number; is_liked: boolean; };
type Log = { id: string; title?: string; content: string; created_at: string; pain_score: number; user_id: string; is_public: boolean; image_url?: string; log_type?: 'workout' | 'rehab' | 'match'; media_type?: 'image' | 'video'; match_result?: 'win' | 'lose' | 'draw' | 'none'; goals?: number; assists?: number; profile?: Profile; like_count: number; is_liked: boolean; comments: Comment[]; };
type Notice = { id: number; title: string; content: string; created_at: string; };
type RankedUser = Profile & { logCount: number; rank: number; };
type Notification = { id: number; actor_name: string; log_id: string; type: string; message: string; is_read: boolean; created_at: string; };

const getLevel = (count: number) => {
  if (count >= 50) return { name: 'World Class', emoji: '👑', color: 'bg-purple-600 text-white' };
  if (count >= 30) return { name: 'Pro', emoji: '🔥', color: 'bg-red-500 text-white' };
  if (count >= 10) return { name: 'Semi-Pro', emoji: '🏃', color: 'bg-blue-500 text-white' };
  return { name: 'Rookie', emoji: '🐣', color: 'bg-green-500 text-white' };
};

const formatContent = (rawContent: string) => {
  const match = rawContent.match(/^\[(.*?)\]\s*([\s\S]*)/);
  if (match) {
    const tags = match[1].split(',').map(t => t.trim()).filter(Boolean);
    const text = match[2];
    return { tags, text };
  }
  return { tags: [], text: rawContent };
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

  const [searchTerm, setSearchTerm] = useState('');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // 🚨 신고 드롭다운 메뉴 상태 관리
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
        const { data: notiData } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
        if (notiData) setNotifications(notiData);
    }

    const { data: noticesData } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (noticesData) setNotices(noticesData);

    const { data: rawLogsData } = await supabase.from('logs').select('*').eq('is_public', true).order('created_at', { ascending: false });
    const { data: allLogs } = await supabase.from('logs').select('user_id');

    if (!rawLogsData || !allLogs) { setLoading(false); return; }

    // 🚨 [핵심] 신고 데이터 불러와서 3회 이상 신고된 글 블라인드 처리!
    const { data: reportsData } = await supabase.from('reports').select('log_id');
    const reportCounts: Record<string, number> = {};
    reportsData?.forEach(r => { reportCounts[r.log_id] = (reportCounts[r.log_id] || 0) + 1; });

    // 신고 3회 미만인 게시물만 화면에 보여줍니다
    const logsData = rawLogsData.filter(log => (reportCounts[log.id] || 0) < 3);

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

  // 🚨 신고하기 실행 함수
  const handleReport = async (logId: string) => {
      if (!currentUser) return alert("로그인이 필요합니다.");
      if (confirm("이 게시물이 부적절한가요?\n신고가 3회 누적되면 자동으로 숨김 처리됩니다.")) {
          const { error } = await supabase.from('reports').insert({ user_id: currentUser.id, log_id: logId });
          if (error) {
              if (error.code === '23505') alert("이미 신고하신 게시물입니다.");
              else alert("오류가 발생했습니다: " + error.message);
          } else {
              alert("🚨 신고가 접수되었습니다. 깨끗한 문화를 위해 기여해주셔서 감사합니다!");
              setActiveDropdown(null);
              fetchData(); // 3회 누적 시 화면에서 바로 사라지도록 새로고침
          }
      }
  };

  const toggleLike = async (log: Log) => { 
    if (!currentUser) { alert('로그인 필요'); return; } 
    
    if (log.is_liked) {
        await supabase.from('likes').delete().match({ user_id: currentUser.id, log_id: log.id }); 
    } else {
        await supabase.from('likes').insert({ user_id: currentUser.id, log_id: log.id }); 
        if (log.user_id !== currentUser.id) {
            const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', currentUser.id).single();
            const myName = myProfile?.username || '익명 선수';
            await supabase.from('notifications').insert({
                user_id: log.user_id,
                actor_name: myName,
                log_id: log.id,
                type: 'like',
                message: `${myName}님이 회원님의 기록을 응원합니다! 🔥`
            });
        }
    }
    
    setLogs(prev => prev.map(l => {
        if (l.id === log.id) {
            return { ...l, is_liked: !log.is_liked, like_count: log.is_liked ? l.like_count - 1 : l.like_count + 1 };
        }
        return l;
    }));
  };

  const toggleCommentLike = async (commentId: number, currentLiked: boolean) => {
    if (!currentUser) { alert('로그인 필요'); return; }
    if (currentLiked) await supabase.from('comment_likes').delete().match({ user_id: currentUser.id, comment_id: commentId });
    else await supabase.from('comment_likes').insert({ user_id: currentUser.id, comment_id: commentId });
    fetchData(); 
  };

  const addComment = async (log: Log) => { 
    if (!currentUser) { alert('로그인 필요'); return; } 
    const content = commentInputs[log.id]; 
    if (!content?.trim()) return; 
    if (containsBadWord(content)) return alert("🚫 바른 말을 사용해주세요!");
    
    await supabase.from('comments').insert({ content, log_id: log.id, user_id: currentUser.id }); 
    
    if (log.user_id !== currentUser.id) {
        const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', currentUser.id).single();
        const myName = myProfile?.username || '익명 선수';
        await supabase.from('notifications').insert({
            user_id: log.user_id,
            actor_name: myName,
            log_id: log.id,
            type: 'comment',
            message: `${myName}님이 댓글을 남겼습니다: "${content.substring(0, 15)}${content.length > 15 ? '...' : ''}"`
        });
    }

    setCommentInputs({ ...commentInputs, [log.id]: '' }); 
    fetchData(); 
  };

  const deleteComment = async (commentId: number) => { if (!confirm('삭제하시겠습니까?')) return; await supabase.from('comments').delete().eq('id', commentId); fetchData(); };
  const toggleCommentView = (logId: string) => { setExpandedComments(prev => ({ ...prev, [logId]: !prev[logId] })); };

  const handleNotificationClick = async (notiId: number) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notiId);
      setShowNotifications(false);
      fetchData(); 
  };

  const handleAddNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) return alert("내용을 입력하세요!");
    await supabase.from('notices').insert({ title: noticeTitle, content: noticeContent });
    alert("공지 등록 완료! 📢");
    setNoticeTitle(''); setNoticeContent(''); setShowNoticeForm(false);
    fetchData();
  };
  
  const handleDeleteNotice = async (id: number) => { 
      if (!confirm("공지사항을 삭제하시겠습니까?")) return; 
      const { error } = await supabase.from('notices').delete().eq('id', id); 
      if (error) alert("삭제 실패: Supabase 권한(RLS)을 확인해주세요!\n" + error.message);
      else fetchData(); 
  };

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
        
        {/* 🌟 헤더 (Fixed) */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-white/5 h-16 flex items-center shadow-md">
            <div className="max-w-2xl w-full mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/dashboard')}>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-[0_0_10px_rgba(37,99,235,0.4)]">M</div>
                    <span className="text-xl font-black tracking-tight text-white hidden sm:block">MOVEPLAZA</span>
                </div>
                
                <div className="flex items-center gap-2 relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5">
                        <Icons.Bell />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                        )}
                    </button>

                    <button onClick={() => router.push('/dashboard')} className="text-sm font-bold text-slate-300 hover:text-blue-400 bg-slate-900 border border-white/10 px-4 py-2 rounded-full hover:bg-slate-800 transition shadow-sm">
                        🏠 내 일지
                    </button>

                    {showNotifications && (
                        <div className="absolute top-14 right-0 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-white/10 shadow-2xl rounded-2xl p-4 z-50 animate-slide-up custom-scrollbar">
                            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                                <h3 className="font-black text-white text-sm">알림 센터</h3>
                                {unreadCount > 0 && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{unreadCount} 새 알림</span>}
                            </div>
                            
                            {notifications.length === 0 ? (
                                <p className="text-xs text-slate-500 font-bold text-center py-8">새로운 알림이 없습니다.</p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map(noti => (
                                        <div key={noti.id} onClick={() => handleNotificationClick(noti.id)} className={`p-3 rounded-xl cursor-pointer transition flex items-start gap-3 border border-transparent ${noti.is_read ? 'opacity-50 hover:bg-slate-800' : 'bg-blue-900/20 hover:bg-blue-900/30 border-blue-500/20 shadow-sm'}`}>
                                            <span className="text-xl shrink-0 mt-0.5">{noti.type === 'like' ? '❤️' : '💬'}</span>
                                            <div>
                                                <p className="text-sm text-slate-200 font-medium leading-snug tracking-tight">{noti.message}</p>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1.5">{new Date(noti.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* 🚨 화면 전체를 감싸는 div에 onClick 이벤트를 달아서 드롭다운 바깥 클릭 시 닫히도록 함 */}
        <div className="pt-24 pb-20 px-4 md:px-8 max-w-2xl mx-auto space-y-6 md:space-y-8" onClick={() => { if(showNotifications) setShowNotifications(false); if(activeDropdown) setActiveDropdown(null); }}>
            
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">광장</h1>
                    <p className="text-slate-400 font-medium mt-1 text-sm">전국 무브플라자 선수들의 활동 피드</p>
                </div>
                {currentUser?.email === ADMIN_EMAIL && (
                    <button onClick={() => setShowNoticeForm(!showNoticeForm)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded-full font-bold transition border border-white/10">📢 공지 쓰기</button>
                )}
            </div>

            <div className="mb-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <Icons.Search />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="관심 부위나 선수를 검색해보세요" 
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-800 border border-white/10 rounded-2xl text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-md transition-all"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors">
                            <Icons.X />
                        </button>
                    )}
                </div>
            </div>

            {currentUser?.email === ADMIN_EMAIL && showNoticeForm && (
                <div className="bg-slate-900 p-6 rounded-3xl border border-blue-500/30 shadow-lg">
                    <h3 className="font-black text-lg mb-4 text-white">새 공지사항 작성</h3>
                    <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="공지 제목" className="w-full p-3 mb-3 bg-slate-800 rounded-xl font-bold border border-slate-700 text-white outline-none focus:border-blue-500" />
                    <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="공지 내용" className="w-full p-3 mb-4 bg-slate-800 rounded-xl h-24 font-medium border border-slate-700 text-white outline-none focus:border-blue-500 resize-none" />
                    <button onClick={handleAddNotice} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition">등록하기</button>
                </div>
            )}

            {!searchTerm && notices.length > 0 && (
                <div className="space-y-3">
                    {notices.map((notice) => (
                        <div key={notice.id} className="bg-blue-900/20 p-5 rounded-2xl flex flex-col gap-1 relative border border-blue-500/20 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">필독</span>
                                <h4 className="font-black text-blue-100">{notice.title}</h4>
                            </div>
                            <p className="text-blue-200/80 text-sm whitespace-pre-wrap font-medium">{notice.content}</p>
                            <span className="text-[10px] text-blue-500/50 font-bold mt-1">{new Date(notice.created_at).toLocaleDateString()}</span>
                            {currentUser?.email === ADMIN_EMAIL && <button onClick={() => handleDeleteNotice(notice.id)} className="absolute top-4 right-4 text-xs text-slate-500 hover:text-red-500 font-bold p-1"><Icons.X /></button>}
                        </div>
                    ))}
                </div>
            )}

            {!searchTerm && ranking.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 md:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
                    
                    <h2 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-2 tracking-tight whitespace-nowrap">
                        🏆 명예의 전당 <span className="text-[10px] md:text-xs text-slate-400 font-medium">TOP 3</span>
                    </h2>
                    
                    <div className="grid grid-cols-3 gap-2 md:gap-4 items-end w-full">
                        {ranking[1] && (
                            <div className="flex flex-col items-center gap-1.5 pb-2 md:pb-4 w-full">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-slate-500 overflow-hidden bg-slate-700 shadow-md">
                                    {ranking[1].avatar_url ? <img src={ranking[1].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                                </div>
                                <div className="flex flex-col items-center w-full px-1">
                                    <span className="bg-slate-600 text-white text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-full mb-0.5">2ND</span>
                                    <p className="font-bold text-[10px] md:text-sm text-center truncate w-full">{ranking[1].username}</p>
                                </div>
                            </div>
                        )}
                        
                        {ranking[0] && (
                            <div className="flex flex-col items-center gap-1 z-10 w-full relative">
                                <div className="text-2xl md:text-3xl -mb-2 z-20">👑</div>
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-slate-700 z-10">
                                    {ranking[0].avatar_url ? <img src={ranking[0].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl">👤</div>}
                                </div>
                                <div className="flex flex-col items-center w-full px-1 mt-1">
                                    <span className="bg-yellow-400 text-yellow-950 text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full mb-0.5 shadow-sm">1ST</span>
                                    <p className="font-black text-xs md:text-base text-yellow-100 text-center truncate w-full">{ranking[0].username}</p>
                                    <p className="text-[8px] md:text-[10px] text-yellow-500/80 font-bold">{ranking[0].logCount}회</p>
                                </div>
                            </div>
                        )}
                        
                        {ranking[2] && (
                            <div className="flex flex-col items-center gap-1.5 pb-2 md:pb-4 w-full">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-orange-700 overflow-hidden bg-slate-700 shadow-md">
                                    {ranking[2].avatar_url ? <img src={ranking[2].avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                                </div>
                                <div className="flex flex-col items-center w-full px-1">
                                    <span className="bg-orange-800 text-white text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-full mb-0.5">3RD</span>
                                    <p className="font-bold text-[10px] md:text-sm text-center truncate w-full">{ranking[2].username}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-6 pt-4">
            {filteredLogs.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-white/10">
                    <p className="text-4xl mb-4">🌫️</p>
                    <p className="text-slate-500 font-bold">검색 결과가 없습니다.</p>
                </div>
            ) : (
                filteredLogs.map((log) => {
                    const isExpanded = expandedComments[log.id];
                    const visibleComments = isExpanded ? log.comments : log.comments.slice(0, 2);
                    const hiddenCount = log.comments.length - 2;
                    
                    const { tags, text } = formatContent(log.content);

                    return (
                    <div key={log.id} className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-xl mb-8">
                        
                        <div className="p-4 md:p-5 pb-3 flex items-center justify-between relative">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0 cursor-pointer">
                                    {log.profile?.avatar_url ? <img src={log.profile.avatar_url} alt="프사" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-black text-white text-sm cursor-pointer">{log.profile?.username || '이름 없음'}</p>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5 ${log.profile?.color || 'bg-slate-800 text-slate-400'}`}>
                                            {log.profile?.emoji} {log.profile?.level}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold mt-0.5">
                                        <span>{log.profile?.position || '미설정'}</span>
                                        <span>·</span>
                                        <span>{new Date(log.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 🚨 신고 버튼 드롭다운 메뉴 (쩜쩜쩜 아이콘 클릭 시 오픈) */}
                            <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === log.id ? null : log.id); }} className="text-slate-600 hover:text-slate-300 p-1">
                                    <Icons.More />
                                </button>
                                {activeDropdown === log.id && (
                                    <div className="absolute right-0 top-8 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleReport(log.id)} className="w-full px-4 py-3 text-left text-sm font-bold text-red-400 hover:bg-red-500/10 transition flex items-center gap-2">
                                            <Icons.Flag /> 신고하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-4 md:px-5 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase border ${
                                    log.log_type === 'match' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                    (log.log_type === 'workout' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')
                                }`}> 
                                    {log.log_type === 'match' ? 'MATCH' : (log.log_type === 'workout' ? 'WORKOUT' : 'REHAB')} 
                                </span>
                                {log.pain_score > 0 && (
                                    <span className="text-[10px] font-bold text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                                        강도 <span className={log.pain_score >= 7 ? 'text-red-400' : 'text-white'}>{log.pain_score}</span>
                                    </span>
                                )}
                            </div>
                            
                            {log.title && <h2 className="text-lg font-black text-white mb-2 tracking-tight">{log.title}</h2>}
                            
                            <p className="text-slate-200 text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                                {text}
                            </p>
                            
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {tags.map((tag, idx) => (
                                        <span key={idx} className="text-xs font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {log.image_url && ( 
                            <div className="w-full bg-slate-950 border-y border-white/5 flex items-center justify-center"> 
                                {log.media_type === 'video' ? ( 
                                    <video src={log.image_url} controls className="w-full h-auto object-contain" style={{ maxHeight: '80vh' }} /> 
                                ) : ( 
                                    <img src={log.image_url} alt="게시물 미디어" className="w-full h-auto object-contain" style={{ maxHeight: '80vh' }} /> 
                                )} 
                            </div> 
                        )}

                        {log.log_type === 'match' && (
                            <div className="mx-4 md:mx-5 my-4 bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-inner">
                                <div className="text-center flex-1">
                                    <p className="text-[9px] text-slate-500 font-bold mb-1 tracking-widest">RESULT</p>
                                    <p className={`text-base font-black uppercase tracking-tight ${log.match_result === 'win' ? 'text-blue-400' : (log.match_result === 'lose' ? 'text-red-400' : 'text-slate-300')}`}>
                                        {log.match_result === 'win' ? 'WIN' : (log.match_result === 'lose' ? 'LOSE' : 'DRAW')}
                                    </p>
                                </div>
                                <div className="w-[1px] h-6 bg-white/10"></div>
                                <div className="text-center flex-1">
                                    <p className="text-[9px] text-slate-500 font-bold mb-1 tracking-widest">GOALS</p>
                                    <p className="text-lg font-black text-yellow-400 leading-none">{log.goals || 0}</p>
                                </div>
                                <div className="w-[1px] h-6 bg-white/10"></div>
                                <div className="text-center flex-1">
                                    <p className="text-[9px] text-slate-500 font-bold mb-1 tracking-widest">ASSISTS</p>
                                    <p className="text-lg font-black text-emerald-400 leading-none">{log.assists || 0}</p>
                                </div>
                            </div>
                        )}

                        <div className="px-4 md:px-5 py-3 flex items-center gap-4">
                            <button onClick={() => toggleLike(log)} className="flex items-center gap-1.5 group">
                                {log.is_liked ? <Icons.HeartFilled /> : <Icons.HeartOutline />}
                                <span className={`text-sm font-bold ${log.is_liked ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-300'}`}>{log.like_count || 0}</span>
                            </button>
                            <button className="flex items-center gap-1.5 group cursor-default">
                                <Icons.Comment />
                                <span className="text-sm font-bold text-slate-400">{log.comments.length}</span>
                            </button>
                        </div>

                        <div className="px-4 md:px-5 pb-5">
                            {log.comments.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {visibleComments.map(comment => (
                                        <div key={comment.id} className="flex gap-2 items-start text-xs md:text-sm group/comment">
                                            <span className="font-bold text-slate-200 shrink-0 cursor-pointer">{comment.profile?.username || '익명'}</span>
                                            <span className="text-slate-300 font-normal break-words flex-1">{comment.content}</span>
                                            
                                            <div className="flex items-center gap-2 transition-opacity">
                                                <button onClick={() => toggleCommentLike(comment.id, comment.is_liked)} className={`text-[10px] flex items-center gap-1 font-bold ${comment.is_liked ? 'text-red-500' : 'text-slate-500 hover:text-red-400'}`}>
                                                    {comment.is_liked ? '❤️' : '🤍'} {comment.like_count > 0 && comment.like_count}
                                                </button>
                                                {currentUser?.id === comment.user_id && <button onClick={() => deleteComment(comment.id)} className="text-slate-500 hover:text-red-500 font-bold px-1 text-[10px]">✕</button>}
                                            </div>
                                        </div>
                                    ))}
                                    {log.comments.length > 2 && (
                                        <button onClick={() => toggleCommentView(log.id)} className="text-xs font-bold text-slate-500 hover:text-slate-300 mt-1 block">
                                            {isExpanded ? '댓글 숨기기' : `댓글 ${hiddenCount}개 모두 보기`}
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 items-center mt-2 relative">
                                <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-white/10">
                                     <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>
                                </div>
                                <input 
                                    type="text" 
                                    value={commentInputs[log.id] || ''} 
                                    onChange={(e) => setCommentInputs({...commentInputs, [log.id]: e.target.value})} 
                                    onKeyDown={(e) => e.key === 'Enter' && addComment(log)} 
                                    placeholder="댓글 달기..." 
                                    className="flex-1 bg-transparent border-none text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0" 
                                />
                                {commentInputs[log.id]?.trim() && (
                                    <button onClick={() => addComment(log)} className="text-blue-500 font-bold text-sm pr-2 hover:text-blue-400 transition animate-fade-in">
                                        게시
                                    </button>
                                )}
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