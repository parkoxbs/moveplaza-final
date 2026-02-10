'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 👇 1. 부위별 질문 데이터 (Red Flag 기반 Triage)
const CHECKLIST_DATA: any = {
  "무릎": [
    { text: "다칠 때 '뚝' 하는 소리나 끊어지는 느낌이 났나요?", desc: "십자인대나 연골판 손상의 대표적인 신호입니다.", isRedFlag: true },
    { text: "다친 직후 무릎이 심하게 부어올랐나요?", desc: "관절 내 출혈(Hemarthrosis) 가능성이 있습니다.", isRedFlag: true },
    { text: "무릎이 펴지거나 굽혀지지 않고 걸린 느낌(잠김)이 있나요?", desc: "반월상 연골판이 찢어져 관절 사이에 끼었을 수 있습니다.", isRedFlag: true },
    { text: "체중을 싣고 걷기가 거의 불가능한가요?", desc: "골절이나 심각한 인대 파열을 의심해야 합니다.", isRedFlag: true },
    { text: "계단을 내려갈 때 특히 통증이 심한가요?", desc: "슬개대퇴통증증후군이나 건염일 수 있습니다.", isRedFlag: false },
  ],
  "발목": [
    { text: "다친 직후에 발을 땅에 딛고 4발자국 이상 걷지 못했나요?", desc: "오타와 앵클 룰(Ottawa Ankle Rules)에 따른 골절 의심 신호입니다.", isRedFlag: true },
    { text: "복사뼈(안쪽/바깥쪽 튀어나온 뼈)를 눌렀을 때 '악' 소리 나게 아픈가요?", desc: "인대가 아닌 뼈의 골절 가능성이 있습니다.", isRedFlag: true },
    { text: "발목 모양이 눈에 띄게 변형되었거나 탈구된 것 같나요?", desc: "즉시 응급 처치가 필요한 상황입니다.", isRedFlag: true },
    { text: "발가락을 위로 들어 올리거나 아래로 내릴 때 힘이 안 들어가나요?", desc: "신경 손상이나 힘줄 파열 가능성이 있습니다.", isRedFlag: true },
    { text: "발목을 돌릴 때만 뻐근하고 부기는 심하지 않나요?", desc: "가벼운 염좌(1도)일 가능성이 높습니다.", isRedFlag: false },
  ],
  "허리": [
    { text: "통증이 엉덩이를 타고 다리 저림(전기 통하는 느낌)으로 내려오나요?", desc: "디스크(추간판 탈출증)로 인한 신경 압박 신호일 수 있습니다.", isRedFlag: true },
    { text: "발가락이나 발목에 힘이 빠져서 걷다가 발이 끌리나요?", desc: "운동 신경 마비가 진행 중일 수 있어 응급 상황입니다.", isRedFlag: true },
    { text: "소변이나 대변을 보는데 감각이 없거나 조절이 안 되나요?", desc: "마미증후군(Cauda Equina)이라는 초응급 상황입니다. 즉시 응급실로 가세요.", isRedFlag: true },
    { text: "최근에 높은 곳에서 떨어지거나 교통사고 등 큰 충격이 있었나요?", desc: "척추 골절 가능성을 확인해야 합니다.", isRedFlag: true },
    { text: "숙이거나 젖힐 때만 허리 중앙이 뻐근한가요?", desc: "단순 요추 염좌(근육통)일 가능성이 높습니다.", isRedFlag: false },
  ],
  "햄스트링": [
    { text: "스프린트(전력질주) 도중 허벅지 뒤에서 '뚝' 소리가 났나요?", desc: "근육이나 힘줄의 완전 파열 신호일 수 있습니다.", isRedFlag: true },
    { text: "허벅지 뒤쪽에 시퍼런 멍이 들었나요?", desc: "근육 파열로 인한 내출혈 증상입니다.", isRedFlag: true },
    { text: "허벅지 뒤쪽을 만졌을 때 움푹 패인 곳이 만져지나요?", desc: "근육이 찢어져서 생긴 결손 부위일 수 있습니다.", isRedFlag: true },
    { text: "걷기 힘들 정도로 통증이 심해 절뚝거리나요?", desc: "2도 이상의 심각한 손상일 수 있습니다.", isRedFlag: true },
    { text: "다리를 쭉 펴고 스트레칭할 때만 당기는 느낌이 드나요?", desc: "가벼운 미세 손상이나 근육 뭉침일 수 있습니다.", isRedFlag: false },
  ],
  "어깨": [
    { text: "팔이 빠진 것 같은 느낌이 들거나 외형이 변했나요?", desc: "어깨 탈구(Dislocation) 가능성이 높습니다.", isRedFlag: true },
    { text: "팔을 스스로 들어 올릴 수 없나요? (남이 들어주면 올라감)", desc: "회전근개 파열이나 신경 손상을 의심해야 합니다.", isRedFlag: true },
    { text: "손이나 팔 쪽으로 저림 증상이나 감각 이상이 있나요?", desc: "목 디스크나 신경총 손상일 수 있습니다.", isRedFlag: true },
    { text: "밤에 통증이 심해서 아픈 쪽으로 누워 자기가 힘든가요?", desc: "회전근개 질환이나 석회성 건염의 특징입니다.", isRedFlag: false }, // 주의지만 Red Flag까지는 아님
    { text: "팔을 돌릴 때 '두둑' 소리가 나지만 통증은 없나요?", desc: "단순한 관절음일 수 있습니다.", isRedFlag: false },
  ],
  "손목": [
    { text: "넘어질 때 손을 짚은 후 손목 모양이 변형되었나요?", desc: "손목 골절(Colles fracture 등)의 신호입니다.", isRedFlag: true },
    { text: "엄지손가락 쪽 손목 오목한 곳(코담배갑)을 누르면 자지러지게 아픈가요?", desc: "주상골 골절일 수 있으며, 엑스레이에 잘 안 보일 수 있어 주의해야 합니다.", isRedFlag: true },
    { text: "손가락 끝이 저리거나 감각이 둔해졌나요?", desc: "신경 압박이나 손상을 의심해야 합니다.", isRedFlag: true },
    { text: "주먹을 쥐거나 물건을 잡을 때 힘이 안 들어가나요?", desc: "인대 파열이나 심각한 손상일 수 있습니다.", isRedFlag: true },
    { text: "손목을 짚고 일어날 때만 시큰거나요?", desc: "TFCC 손상이나 건염일 가능성이 있습니다.", isRedFlag: false },
  ]
};

// 아이콘
const Icons = {
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 animate-pulse"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
};

export default function SelfCheckPage() {
  const router = useRouter();
  
  // 상태 관리
  const [agreed, setAgreed] = useState(false); // 면책 조항 동의
  const [selectedPart, setSelectedPart] = useState<string | null>(null); // 선택된 부위
  const [step, setStep] = useState(0); // 현재 질문 번호
  const [redFlagCount, setRedFlagCount] = useState(0); // 위험 신호 개수
  const [isFinished, setIsFinished] = useState(false); // 검사 완료

  // 현재 부위의 질문들 가져오기
  const currentQuestions = selectedPart ? CHECKLIST_DATA[selectedPart] : [];

  // 답변 처리
  const handleAnswer = (answer: boolean) => {
    if (answer && currentQuestions[step].isRedFlag) {
      setRedFlagCount(prev => prev + 1);
    }

    if (step < currentQuestions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const resetTest = () => {
    setStep(0);
    setRedFlagCount(0);
    setIsFinished(false);
    setSelectedPart(null);
  };

  // 1. 면책 조항 (가장 먼저 뜸)
  if (!agreed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-900 border border-red-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <div className="flex justify-center mb-4"><Icons.Alert /></div>
          <h2 className="text-xl font-black text-white mb-2">시작 전 필수 확인</h2>
          <div className="text-left text-slate-300 text-sm space-y-3 mb-6 font-medium leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-white/5">
            <p>1. 이 결과는 <strong>의학적 진단이 아니며</strong>, 병원 방문 여부를 결정하기 위한 참고용 정보입니다.</p>
            <p>2. 개발자는 물리치료학과 재학생이며, 전문 의료인이 아닙니다.</p>
            <p>3. 통증이 심하거나 지속되면 앱 결과와 상관없이 <strong>즉시 병원</strong>에 가셔야 합니다.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-sm">뒤로가기</button>
            <button onClick={() => setAgreed(true)} className="flex-[2] py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition shadow-lg text-sm">네, 이해했습니다</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white p-4 md:p-8 flex flex-col items-center justify-center pb-24">
      
      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 p-4 w-full flex justify-between items-center z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><Icons.Back /></button>
        <span className="font-black text-lg">자가 체크 ✅</span>
        <div className="w-6"></div>
      </div>

      <div className="max-w-md w-full">
        
        {/* 2. 부위 선택 화면 */}
        {!selectedPart ? (
            <div className="animate-slide-up">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black mb-2 text-white">어디가 불편하신가요?</h2>
                    <p className="text-slate-400 text-sm font-bold">통증이 있는 부위를 선택해주세요.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {Object.keys(CHECKLIST_DATA).map((part) => (
                        <button 
                            key={part} 
                            onClick={() => setSelectedPart(part)}
                            className="bg-slate-900 border border-white/10 hover:border-blue-500 hover:bg-blue-900/20 py-6 rounded-2xl font-bold text-lg transition shadow-lg flex flex-col items-center justify-center gap-2 group"
                        >
                            <span className="text-3xl group-hover:scale-110 transition">
                                {part === '무릎' ? '🦵' : part === '발목' ? '🦶' : part === '허리' ? '🧘' : part === '햄스트링' ? '🏃' : part === '어깨' ? '🙆‍♂️' : '✋'}
                            </span>
                            {part}
                        </button>
                    ))}
                </div>
                <div className="mt-8 p-4 bg-blue-900/20 rounded-2xl border border-blue-500/20 text-center">
                    <p className="text-xs text-blue-300 font-bold">💡 Tip. 통증이 여러 곳이라면 가장 아픈 곳부터 체크해보세요.</p>
                </div>
            </div>
        ) : !isFinished ? (
            /* 3. 질문 진행 화면 */
            <div className="animate-fade-in">
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold text-blue-400 mb-2">
                        <span>{selectedPart} 체크 중...</span>
                        <span>{step + 1} / {currentQuestions.length}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${((step + 1) / currentQuestions.length) * 100}%` }}></div>
                    </div>
                </div>

                <div className="min-h-[220px] flex flex-col items-center justify-center text-center mb-8 bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                    <h2 className="text-xl font-black leading-snug mb-4 break-keep">
                        {currentQuestions[step].text}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium bg-black/40 px-3 py-2 rounded-lg break-keep">
                        💡 {currentQuestions[step].desc}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer(false)} className="py-5 bg-slate-800 rounded-2xl text-lg font-bold text-slate-300 hover:bg-slate-700 transition">
                    아니요
                    </button>
                    <button onClick={() => handleAnswer(true)} className="py-5 bg-blue-600 rounded-2xl text-lg font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/30">
                    네, 그래요
                    </button>
                </div>
            </div>
        ) : (
            /* 4. 결과 화면 */
            <div className="animate-slide-up bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    {redFlagCount > 0 ? <Icons.Alert /> : <Icons.Check />}
                </div>
                
                <h2 className="text-2xl font-black mb-2 text-white">
                    {redFlagCount > 0 ? '병원 방문을 권장합니다 🏥' : '휴식과 관리가 필요해요 🧊'}
                </h2>
                
                <div className="text-slate-300 text-sm font-medium mb-8 leading-relaxed space-y-3 bg-slate-950/50 p-5 rounded-2xl text-left border border-white/5">
                    <p className="border-b border-white/10 pb-2 mb-2 font-bold text-white">
                        [{selectedPart}] 진단 결과 요약
                    </p>
                    {redFlagCount > 0 ? (
                        <>
                            <p className="text-red-400 flex gap-2"><span>🚨</span> <span>위험 신호(Red Flag)가 <strong>{redFlagCount}개</strong> 감지되었습니다.</span></p>
                            <p className="flex gap-2"><span>🩺</span> <span>인대, 연골, 신경, 또는 뼈의 손상이 의심되는 증상이 포함되어 있습니다.</span></p>
                            <p className="flex gap-2"><span>🏥</span> <span>더 이상 운동하지 마시고, <strong>정형외과 전문의</strong>의 정확한 진단과 영상 검사(X-ray 등)를 받아보세요.</span></p>
                        </>
                    ) : (
                        <>
                            <p className="text-green-400 flex gap-2"><span>✅</span> <span>다행히 즉각적인 수술이나 응급 처치가 필요한 위험 신호는 발견되지 않았습니다.</span></p>
                            <p className="flex gap-2"><span>🩹</span> <span>일시적인 근육통이나 가벼운 염좌일 가능성이 높습니다.</span></p>
                            <p className="flex gap-2"><span>🧊</span> <span><strong>R.I.C.E (휴식, 냉찜질, 압박, 거상)</strong> 요법을 시행하며 2-3일간 경과를 지켜보세요. 그래도 아프면 병원에 가야 합니다.</span></p>
                        </>
                    )}
                </div>
                
                {redFlagCount > 0 && (
                    <a href={`https://map.naver.com/p/search/${selectedPart} 정형외과`} target="_blank" rel="noreferrer" className="block w-full py-4 bg-white text-red-600 font-black rounded-xl mb-3 hover:bg-slate-100 transition shadow-lg flex items-center justify-center gap-2">
                        🏥 근처 정형외과 찾기
                    </a>
                )}
                
                <div className="flex gap-2">
                    <button onClick={resetTest} className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 flex items-center justify-center gap-1"><Icons.Refresh /> 다시 하기</button>
                    <Link href="/dashboard" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-center text-sm flex items-center justify-center hover:bg-blue-500">홈으로</Link>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}