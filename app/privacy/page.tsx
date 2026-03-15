"use client"

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 text-slate-800 bg-white min-h-screen font-sans">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-black mb-3 text-slate-900 tracking-tight">이용약관 및 개인정보처리방침</h1>
        <p className="text-slate-500 font-bold text-sm">최종 수정일: 2024년 10월 24일</p>
      </div>
      
      <div className="space-y-10 text-sm leading-relaxed text-slate-700">
        
        {/* --- 개인정보 처리방침 파트 --- */}
        <div>
          <h2 className="text-xl font-black mb-4 text-blue-600 border-b-2 border-blue-100 pb-2">제1장. 개인정보 처리방침</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-base font-bold mb-2 text-slate-900">1. 개인정보의 수집 및 이용 목적</h3>
              <p>본 서비스(MOVEPLAZA, 이하 '회사')는 다음의 목적을 위해 개인정보를 수집하고 이용합니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>사용자별 운동, 경기, 재활 기록 저장 및 맞춤형 대시보드 제공</li>
                <li>통증 수치(VAS) 및 운동 강도(RPE) 분석을 통한 부상 히트맵 리포트 제공</li>
                <li>커뮤니티(광장) 기능 제공 (게시물 등록, 댓글, 좋아요 기능 지원)</li>
                <li>불량 이용자의 부정 이용 방지, 불만 처리 및 고객 서비스 응대</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-2 text-slate-900">2. 수집하는 개인정보 및 데이터 항목</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-bold">회원가입 시:</span> 이메일 주소, 비밀번호, 소셜 로그인 식별자</li>
                <li><span className="font-bold">프로필 정보:</span> 닉네임, 주 활동 포지션, 프로필 사진</li>
                <li><span className="font-bold">서비스 이용 데이터:</span> 운동 내용, 통증 부위, 컨디션 점수, 첨부한 사진 및 동영상 미디어</li>
                <li><span className="font-bold">커뮤니티 데이터:</span> 작성한 게시글, 댓글, 좋아요 내역, 신고 내역</li>
                <li><span className="font-bold">자동 수집 항목:</span> 기기 정보, 접속 로그 (서비스 오류 분석 및 개선 목적)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold mb-2 text-slate-900">3. 개인정보의 보유 및 파기</h3>
              <p>이용자의 개인정보는 <span className="font-bold text-red-500">회원 탈퇴 시 즉각적이고 영구적으로 삭제(파기)</span>됩니다. 탈퇴 절차 진행 시, 작성한 일지, 전술판 데이터, 커뮤니티 게시물 등 모든 데이터는 복구 불가능한 상태로 폐기됩니다.</p>
            </section>

            <section>
              <h3 className="text-base font-bold mb-2 text-slate-900">4. 개인정보의 제3자 제공</h3>
              <p>회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 법령에 의거하여 수사 기관의 적법한 요구가 있는 경우는 예외로 합니다.</p>
            </section>
          </div>
        </div>

        {/* --- 이용약관 및 면책조항 파트 --- */}
        <div>
          <h2 className="text-xl font-black mb-4 text-red-600 border-b-2 border-red-100 pb-2">제2장. 이용약관 및 면책 조항 (필독)</h2>
          
          <div className="space-y-6">
            <section className="bg-red-50 p-5 rounded-2xl border border-red-200">
              <h3 className="text-lg font-black mb-2 text-red-600 flex items-center gap-2">
                🚨 1. 의학적 진단 및 치료에 대한 면책
              </h3>
              <p className="text-red-800 font-bold mb-2">
                본 앱에서 제공하는 모든 데이터 분석(부상 히트맵, 통증 점수, 재활 팁 등)은 사용자가 직접 입력한 주관적 수치를 기반으로 한 <span className="underline">단순 참고용 및 통계용 정보</span>입니다.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-red-700 text-sm">
                <li>본 서비스는 전문적인 의학적 진단, 처방 또는 치료를 결코 대신할 수 없습니다.</li>
                <li>심각한 통증, 부상 또는 질환이 의심될 경우 반드시 병원을 방문하여 전문 의료진의 상담과 진료를 받아야 합니다.</li>
                <li>회사는 사용자가 본 앱의 정보에 의존하여 취한 행동(운동 지속, 자가 재활 등)으로 인해 발생한 어떠한 신체적, 정신적 피해나 부상 악화에 대해서도 민·형사상 책임을 지지 않습니다.</li>
              </ul>
            </section>

            <section className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="text-base font-black mb-2 text-slate-900">2. 사용자 생성 콘텐츠 (UGC) 및 커뮤니티 정책</h3>
              <p className="mb-2">사용자가 '광장(커뮤니티)'에 업로드하는 모든 게시물(사진, 영상, 텍스트)에 대한 권리와 법적 책임은 작성자 본인에게 있습니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-bold text-blue-600">AI 이미지 필터링:</span> 쾌적한 환경을 위해, 이미지 업로드 시 클라이언트 기반 AI 모델(nsfwjs)이 선정성 및 유해성을 스캔합니다. 부적절한 이미지로 판별될 경우 업로드가 즉시 차단됩니다.</li>
                <li><span className="font-bold text-orange-600">누적 신고 블라인드:</span> 욕설, 타인 비방, 불쾌감을 주는 게시물은 유저 신고 대상이 되며, <span className="font-bold">신고가 3회 이상 누적된 게시물은 자동으로 블라인드(숨김) 처리</span>됩니다.</li>
                <li>타인의 저작권 및 초상권을 침해하거나 불법적인 내용을 게시할 경우, 사전 통보 없이 게시물 삭제 및 계정 영구 정지 조치가 취해질 수 있습니다.</li>
              </ul>
            </section>

            <section className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="text-base font-black mb-2 text-slate-900">3. 서비스 제공 및 데이터 관리 면책</h3>
              <p>회사는 안정적인 서비스 제공을 위해 최선을 다합니다. 다만, 다음의 경우로 인한 서비스 중단 및 데이터 유실에 대해서는 책임을 지지 않습니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>천재지변, 서버(클라우드) 장애, 해킹 등 불가항력적인 사유로 인한 데이터 유실</li>
                <li>무료 서비스 운영 중, 시스템 점검 또는 운영상 필요에 의한 예고 없는 서비스 중단</li>
                <li>사용자의 기기 분실, 계정 비밀번호 관리 소홀 등으로 발생한 정보 유출 및 손해</li>
              </ul>
            </section>

          </div>
        </div>

        {/* --- 관리자 정보 --- */}
        <div className="pt-8 border-t border-slate-200 text-center text-slate-500">
          <p className="font-bold mb-1">개인정보 보호 및 서비스 책임자</p>
          <p>성명: 박준혁</p>
          <p>이메일: <a href="mailto:agricb83@gmail.com" className="text-blue-500 hover:underline">agricb83@gmail.com</a></p>
        </div>

      </div>
    </div>
  );
}