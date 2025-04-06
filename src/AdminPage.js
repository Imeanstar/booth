import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc,
  getDoc, setDoc, serverTimestamp, query, where, getDocs, orderBy
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Bell } from 'lucide-react';

const AdminPage = () => {
  // 🔧 상태 관리
  const [activeTab, setActiveTab] = useState('coin');
  const [coinPrice, setCoinPrice] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [marketItems, setMarketItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', stock: '' });
  const [editItem, setEditItem] = useState(null);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [lastRequestId, setLastRequestId] = useState(null);

  // 🛒 마켓 아이템 실시간 감지
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'marketItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarketItems(items);
    });
    return () => unsubscribe();
  }, []);

  // 🔔 구매 요청 실시간 감지 및 모달 알림
  useEffect(() => {
    const q = query(collection(db, 'purchaseRequests'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pending = requests.filter(r => r.status === 'pending');
      setPurchaseRequests(pending);

      if (pending.length > 0 && pending[0].id !== lastRequestId) {
        setLastRequestId(pending[0].id);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 3000);
      }
    });
    return () => unsubscribe();
  }, [lastRequestId]);

  // ✅ 구매 승인 처리
  const handleApprove = async (id) => {
    const reqDoc = purchaseRequests.find(r => r.id === id);
    if (!reqDoc) return;

    const itemRef = doc(db, 'marketItems', reqDoc.itemId);
    const itemSnap = await getDoc(itemRef);
    if (!itemSnap.exists()) return alert('해당 물품을 찾을 수 없습니다.');

    const currentStock = parseInt(itemSnap.data().stock);
    const newStock = currentStock - parseInt(reqDoc.quantity);
    if (newStock < 0) return alert('재고가 부족합니다.');

    await updateDoc(itemRef, { stock: newStock });
    await updateDoc(doc(db, 'purchaseRequests', id), {
      status: 'approved',
      approvedAt: Timestamp.now()
    });
  };

  // ❌ 구매 거절 처리 + 환불
  const handleReject = async (id) => {
    try {
      const reqDoc = purchaseRequests.find(r => r.id === id);
      if (!reqDoc) return;

      await updateDoc(doc(db, 'purchaseRequests', id), {
        status: 'rejected',
        rejectedAt: Timestamp.now()
      });

      const membersRef = collection(db, 'members');
      const q = query(membersRef, where('email', '==', reqDoc.userEmail));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userRef = userDoc.ref;
        const userData = userDoc.data();
        const refund = reqDoc.totalPrice || 0;

        await updateDoc(userRef, {
          balance: (userData.balance || 0) + refund
        });

        alert(`${reqDoc.userEmail}님에게 ${refund}원이 환불되었습니다.`);
      } else {
        alert('사용자를 찾을 수 없어 환불되지 않았습니다.');
      }
    } catch (error) {
      console.error('거절 오류:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    }
  };

  // 💰 증연코인 시세 설정
  const handleSetCoinPrice = async () => {
    try {
      const price = parseInt(coinPrice);
      await addDoc(collection(db, 'coinPriceHistory'), {
        price,
        timestamp: serverTimestamp()
      });

      const coinDocRef = doc(db, 'coin', 'currentPrice');
      const snap = await getDoc(coinDocRef);

      if (!snap.exists()) {
        await setDoc(coinDocRef, { price, timestamp: serverTimestamp() });
      } else {
        await updateDoc(coinDocRef, { price, timestamp: serverTimestamp() });
      }

      alert(`증연코인 가격이 ${price}으로 설정되었습니다.`);
    } catch (error) {
      console.error('시세 설정 실패:', error);
      alert('가격 설정 실패');
    }
  };

  // 🎁 사용자에게 증연코인 부여 또는 차감
  const handleGiveCoins = async () => {
    const emailPrefix = userEmail.split('@')[0];
    const q = query(
      collection(db, 'members'),
      where('email', '>=', emailPrefix),
      where('email', '<', emailPrefix + '\uf8ff')
    );

    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        alert(`${userEmail} 사용자를 찾을 수 없습니다.`);
        return;
      }

      snapshot.forEach(async (docSnap) => {
        const userRef = doc(db, 'members', docSnap.id);
        const currentCoins = docSnap.data().coins || 0;
        let updatedCoins = currentCoins + parseInt(coinAmount);
        if (updatedCoins < 0) updatedCoins = 0;

        await updateDoc(userRef, {
          coins: updatedCoins,
          lastModified: Timestamp.now()
        });

        alert(`${userEmail}에게 ${coinAmount}개의 증연코인이 ${coinAmount > 0 ? '부여' : '차감'}되었습니다.`);
      });
    } catch (error) {
      console.error('코인 부여 실패:', error);
      alert('증연코인 부여 실패');
    }
  };

  // 🛍️ 마켓에 물품 추가
  const handleAddItem = async () => {
    try {
      await addDoc(collection(db, 'marketItems'), {
        name: newItem.name,
        price: parseInt(newItem.price),
        stock: parseInt(newItem.stock),
        timestamp: Timestamp.now()
      });
      alert(`${newItem.name}이 마켓에 추가되었습니다.`);
      setNewItem({ name: '', price: '', stock: '' });
    } catch (error) {
      console.error('추가 실패:', error);
      alert('물품 추가 실패');
    }
  };

  // 🧹 물품 삭제
  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'marketItems', id));
      alert('물품이 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('물품 삭제 실패');
    }
  };

  // ✏️ 물품 수정
  const handleEditItem = async () => {
    if (!editItem?.name || !editItem?.price || !editItem?.stock) {
      return alert('모든 필드를 입력해주세요.');
    }

    try {
      await updateDoc(doc(db, 'marketItems', editItem.id), {
        name: editItem.name,
        price: parseInt(editItem.price),
        stock: parseInt(editItem.stock),
        timestamp: Timestamp.now()
      });
      alert('물품이 수정되었습니다.');
      setEditItem(null);
    } catch (error) {
      console.error('수정 실패:', error);
      alert('물품 수정 실패');
    }
  };

  return (
    <div>
      <h2>운영자 페이지</h2>

      {/* 🔔 알림 버튼 */}
      <div style={{ position: 'absolute', top: 10, right: 20 }}>
        <button onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none' }}>
          <Bell size={24} />
          {purchaseRequests.length > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              backgroundColor: 'red', color: 'white',
              borderRadius: '50%', padding: '2px 6px', fontSize: '12px'
            }}>
              {purchaseRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* 📦 구매 요청 모달 */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 50, right: 20, width: '300px',
          backgroundColor: 'white', border: '1px solid #ccc',
          borderRadius: '8px', padding: '16px', zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h4>구매 요청</h4>
          {purchaseRequests.length === 0 && <p>요청 없음</p>}
          {purchaseRequests.map(req => (
            <div key={req.id} style={{ marginBottom: '10px' }}>
              <strong>구매자:</strong> {req.userEmail}<br />
              <strong>물품:</strong> {req.itemName}<br />
              <strong>수량:</strong> {req.quantity}<br />
              <button onClick={() => handleApprove(req.id)} style={{ marginRight: '5px' }}>승인</button>
              <button onClick={() => handleReject(req.id)}>거절</button>
              <hr />
            </div>
          ))}
          <button onClick={() => setShowModal(false)}>닫기</button>
        </div>
      )}

      {/* 탭 */}
      <div>
        <button onClick={() => setActiveTab('coin')}>증연코인 관리</button>
        <button onClick={() => setActiveTab('market')}>마켓 관리</button>
      </div>

      {/* 코인 탭 */}
      {activeTab === 'coin' && (
        <div>
          <h3>증연코인 설정</h3>
          <div>
            <label>가격 설정 :
              <input type="number" value={coinPrice} onChange={(e) => setCoinPrice(e.target.value)} placeholder="시세 입력" />
            </label>
            <button onClick={handleSetCoinPrice}>가격 설정</button>
          </div>
          <div>
            <h4>사용자에게 증연코인 부여</h4>
            <label>이메일:
              <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="사용자 이메일" />
            </label>
            <label>증연코인 수:
              <input type="number" value={coinAmount} onChange={(e) => setCoinAmount(e.target.value)} placeholder="부여할 코인 수" />
            </label>
            <button onClick={handleGiveCoins}>부여(양수 부여, 음수 차감)</button>
          </div>
        </div>
      )}

      {/* 마켓 탭 */}
      {activeTab === 'market' && (
        <div>
          <h3>마켓 관리</h3>
          <div>
            <h4>물품 추가</h4>
            <input type="text" placeholder="물품 이름" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input type="number" placeholder="가격" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            <input type="number" placeholder="수량" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} />
            <button onClick={handleAddItem}>물품 추가</button>
          </div>

          <h4>물품 리스트</h4>
          {marketItems.map(item => (
            <div key={item.id}>
              <span>{item.name} | 가격: {item.price} | 수량: {item.stock}</span>
              <button onClick={() => handleDeleteItem(item.id)}>삭제</button>
              <button onClick={() => setEditItem(item)}>수정</button>
            </div>
          ))}

          {editItem && (
            <div>
              <h4>물품 수정</h4>
              <input type="text" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
              <input type="number" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} />
              <input type="number" value={editItem.stock} onChange={(e) => setEditItem({ ...editItem, stock: e.target.value })} />
              <button onClick={handleEditItem}>수정</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
