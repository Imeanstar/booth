import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const PurchaseListPage = () => {
  const [purchaseRequests, setPurchaseRequests] = useState([]); // 구매 요청 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    // Firestore에서 purchaseRequests 컬렉션을 최신순으로 구독
    const q = query(
      collection(db, 'purchaseRequests'),
      orderBy('timestamp', 'desc') // 시간 기준 내림차순 정렬
    );

    // 실시간 데이터 수신
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id, // 문서 ID 저장
        ...doc.data(), // 나머지 필드 병합
        timestamp: doc.data().timestamp?.toDate() || null, // Firestore Timestamp → JS Date
      }));
      setPurchaseRequests(requests); // 상태 업데이트
      setLoading(false); // 로딩 종료
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>📦 구매 요청 내역</h2>

      {loading ? (
        <p>불러오는 중...</p>
      ) : purchaseRequests.length === 0 ? (
        <p>구매 요청이 없습니다.</p>
      ) : (
        <ul>
          {purchaseRequests.map((request) => (
            <li key={request.id}>
              <div>
                <p><strong>사용자:</strong> {request.userEmail}</p>
                <p><strong>상품명:</strong> {request.itemName}</p>
                <p><strong>수량:</strong> {request.quantity}</p>
                <p><strong>총 가격:</strong> {request.totalPrice.toLocaleString()}원</p>
                <p><strong>상태:</strong> {request.status}</p>
                <p><strong>요청 시각:</strong> {request.timestamp?.toLocaleString() || '없음'}</p>
              </div>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PurchaseListPage;
