'use client';

import { useState } from 'react';

export default function SelfCheckPage() {
  const [agreed, setAgreed] = useState(false);

  if (!agreed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
        <div className="bg-slate-900 border border-red-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <div className="text-4xl mb-4">🚨</div>
          <h2 className="text-xl font-black text-white mb-2">주의사항 (필독)</h2>
          <div className="text-left text-slate-300 text-sm space-y-3 mb-6 font-medium leading-relaxed">
            <p>
              1. 본 서비스에서 제공하는 결과는 <strong>의학적 진단이 아닙니다.</strong>
            </p>
            <p>
              2. 작성자는 물리치료학과 학생이며, 전문 의료인이 아닙니다. 모든 정보는 일반적인 건강 관리 차원에서 제공됩니다.
            </p>
            <p>
              3. 통증이 심하거나 지속될 경우, <strong>즉시 전문의의 진료</strong>를 받으셔야 합니다. 앱의 정보만 믿고 치료 시기를 놓치지 마세요.
            </p>
          </div>
          <button 
            onClick={() => setAgreed(true)}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition shadow-lg"
          >
            네, 이해했습니다.
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-white">자가 체크 시작...</h1>
      {/* 여기에 체크리스트 기능 구현 */}
    </div>
  );
}