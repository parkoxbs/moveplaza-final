export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-800 bg-white min-h-screen font-sans">
      <h1 className="text-3xl font-black mb-6 border-b pb-4">개인정보 처리방침</h1>
      
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">1. 개인정보의 수집 및 이용 목적</h2>
          <p>본 서비스(Moveplaza)는 다음의 목적을 위해 개인정보를 수집하고 이용합니다.</p>
          <ul className="list-disc pl-5 mt-1">
            <li>사용자별 운동 기록 저장 및 대시보드 제공</li>
            <li>통증 수치(VAS) 및 운동 강도(RPE) 분석을 통한 부상 위험도 리포트 제공</li>
            <li>서비스 개선 및 사용자 문의 응대</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5">
            <li>필수 항목: 이메일 주소, 닉네임 (계정 생성 시)</li>
            <li>서비스 데이터: 운동 종목, 운동 시간, 통증 부위, 통증 수치(VAS), 운동 자각도(RPE)</li>
            <li>자동 수집 항목: 기기 정보, 접속 로그 (서비스 오류 확인용)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>이용자의 개인정보는 원칙적으로 회원 탈퇴 시까지 보유합니다. 탈퇴 시 수집된 개인정보는 지체 없이 파기합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. 개인정보의 제3자 제공</h2>
          <p>본 서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 법령의 규정에 의거한 경우에는 예외로 합니다.</p>
        </section>

        <section>
            <h2 className="text-lg font-bold mb-2">5. 개인정보의 파기 절차 및 방법</h2>
            <p>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 영구 삭제합니다.</p>
        </section>

        <section>
            <h2 className="text-lg font-bold mb-2">6. 이용자의 권리</h2>
            <p>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 동의를 철회할 수 있습니다.</p>
        </section>

        <section>
            <h2 className="text-lg font-bold mb-2">7. 개인정보 보호책임자</h2>
            <p>성명: 박준혁</p>
            <p>이메일: agricb83@gmail.com</p>
        </section>

        <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-lg font-bold text-red-600 mb-2">8. 면책 공지 (중요)</h2>
            <p className="text-red-500 font-bold">본 서비스가 제공하는 분석 결과는 의학적 진단을 대신할 수 없습니다. 심각한 통증이나 부상이 의심될 경우 반드시 전문 의료기관의 진료를 받으시기 바랍니다.</p>
        </div>
      </div>
    </div>
  );
}