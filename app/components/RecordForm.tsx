// 기존 저장 버튼 위에 이 코드를 추가하거나 확인해보세요
<div className="flex items-center space-x-2 my-4">
  <input 
    type="checkbox" 
    id="share-plaza" 
    className="w-4 h-4 text-blue-600"
    // 체크박스 상태 관리용 state를 연결하세요 (예: shareToPlaza)
  />
  <label htmlFor="share-plaza" className="text-sm font-medium text-gray-700">
    광장에 공유하기
  </label>
</div>