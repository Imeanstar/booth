import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const MarketPage = () => {
  const [items, setItems] = useState([]); // 마켓 아이템 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [userBalance, setUserBalance] = useState(0); // 사용자 잔액 상태
  const [userDocId, setUserDocId] = useState(null); // 사용자 문서 ID

  const userEmail = localStorage.getItem('userEmail'); // 로컬 스토리지에서 사용자 이메일 가져오기

  useEffect(() => {
    // 실시간 마켓 아이템 구독
    const unsubscribeItems = onSnapshot(collection(db, 'marketItems'), (snapshot) => {
      const marketItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(marketItems); // 상태 업데이트
      setLoading(false); // 로딩 완료
    });

    // 사용자 balance 실시간 구독 설정
    const fetchUserInfo = async () => {
      const q = query(collection(db, 'members'), where('email', '==', userEmail));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        setUserDocId(docRef.id); // 사용자 문서 ID 저장

        // balance 실시간 반영
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserBalance(docSnap.data().balance || 0);
          }
        });
      } else {
        console.error('사용자 정보 없음');
      }
    };

    fetchUserInfo();

    // 컴포넌트 언마운트 시 마켓 구독 해제
    return () => unsubscribeItems();
  }, []);

  // 구매 요청 처리 함수
  const handleBuy = async (item) => {
    if (item.stock <= 0) {
      alert(`${item.name}는 품절입니다.`);
      return;
    }

    if (userBalance < item.price) {
      alert('금액이 부족합니다.');
      return;
    }

    const purchaseRequest = {
      userEmail,               // 구매자 이메일
      itemName: item.name,     // 물품 이름
      itemId: item.id,         // 물품 고유 ID
      quantity: 1,             // 수량 (고정)
      totalPrice: item.price,  // 총 가격
      status: 'pending',       // 처리 상태: 대기중
      timestamp: serverTimestamp(), // 요청 시간
    };

    try {
      // 구매 요청 Firestore에 추가
      await addDoc(collection(db, 'purchaseRequests'), purchaseRequest);

      // 사용자 잔액 차감
      if (userDocId) {
        const userDocRef = doc(db, 'members', userDocId);
        await updateDoc(userDocRef, {
          balance: userBalance - item.price,
        });
      }

      alert(`${item.name} 구매 요청이 제출되었습니다.`);
    } catch (error) {
      console.error('구매 요청 실패:', error);
      alert('구매 요청 제출에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2>🛒 마켓</h2>

      {/* 사용자 보유 금액 표시 */}
      <div style={{ marginBottom: '15px' }}>
        🪙 현재 보유 금액: <strong>{userBalance.toLocaleString()}</strong> 원
      </div>

      {/* 로딩 상태 또는 아이템 목록 표시 */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h3>물품 목록</h3>
          <div>
            {items.length === 0 ? (
              <p>마켓에 물품이 없습니다.</p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <div>
                      <p><strong>{item.name}</strong></p>
                      <p>가격: {item.price.toLocaleString()} 원</p>
                      <p>수량: {item.stock} 개</p>
                      {item.stock > 0 ? (
                        <button onClick={() => handleBuy(item)}>구매하기</button>
                      ) : (
                        <button disabled>품절</button>
                      )}
                    </div>
                    <hr />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MarketPage;
