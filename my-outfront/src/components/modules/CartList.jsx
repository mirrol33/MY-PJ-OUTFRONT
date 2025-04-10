import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../modules/CartContext";
import "../../scss/pages/cartlist.scss";
import userData from "../../js/data/user_data.json";

function CartList() {
  const { cart, updateCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const [storedUser, setStoredUser] = useState(null);
  const navigate = useNavigate();

  // 최초 사용자 데이터 저장
  useEffect(() => {
    if (!localStorage.getItem("mypage-user-data")) {
      localStorage.setItem("mypage-user-data", JSON.stringify(userData));
    }
  }, []);

  // 로그인 유저 정보 로딩
  useEffect(() => {
    const userInfo = sessionStorage.getItem("minfo");
    if (userInfo) {
      setStoredUser(JSON.parse(userInfo));
    }
  }, []);

  // 수강 중 강의 제거된 장바구니
  const filteredCart = useMemo(() => {
    if (!storedUser) return cart;

    const userEduData =
      JSON.parse(localStorage.getItem("mypage-user-data")) || [];
    const currentUser = userEduData.find((u) => u.uid === storedUser.uid);
    const learningIds = currentUser?.eduIng?.map((edu) => edu.eduId) || [];

    return cart.filter((item) => !learningIds.includes(item.idx));
  }, [cart, storedUser]);

  useEffect(() => {
    const cartIds = cart.map((item) => item.idx);
    const filteredIds = filteredCart.map((item) => item.idx);
    const isDifferent =
      cartIds.length !== filteredIds.length ||
      cartIds.some((id, i) => id !== filteredIds[i]);

    if (isDifferent) {
      updateCart(filteredCart);
    }
  }, [filteredCart, cart, updateCart]);

  const formatPrice = (price) =>
    Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`;

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredCart.length
        ? []
        : filteredCart.map((item) => item.idx)
    );
  };

  const toggleSelect = (idx) => {
    setSelectedItems((prev) =>
      prev.includes(idx) ? prev.filter((id) => id !== idx) : [...prev, idx]
    );
  };

  const deleteSelected = () => {
    if (selectedItems.length === 0) return alert("선택된 항목이 없습니다.");
    const updated = filteredCart.filter(
      (item) => !selectedItems.includes(item.idx)
    );
    updateCart(updated);
    setSelectedItems([]);
  };

  const clearCart = () => {
    if (window.confirm("장바구니를 비우시겠습니까?")) {
      updateCart([]);
      setSelectedItems([]);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return alert("결제할 항목을 선택하세요.");

    if (!storedUser) {
      alert("로그인 후 결제할 수 있습니다!");
      navigate("/login");
      return;
    }

    const selectedCourses = filteredCart.filter((item) =>
      selectedItems.includes(item.idx)
    );
    const totalPrice = selectedCourses.reduce(
      (sum, item) => sum + Number(item.gPrice),
      0
    );

    let userEduData =
      JSON.parse(localStorage.getItem("mypage-user-data")) || [];
    const userIndex = userEduData.findIndex(
      (user) => user.uid === storedUser.uid
    );

    const newEduList = selectedCourses.map((course) => ({
      eduId: course.idx,
      eduName: course.gName,
      eduRate: "0",
      eduState: "학습전",
    }));

    if (userIndex !== -1) {
      // 기존 유저: eduIng에 강의 추가
      const existingEdu = userEduData[userIndex].eduIng || [];
      const mergedEdu = [
        ...existingEdu,
        ...newEduList.filter(
          (newItem) => !existingEdu.some((edu) => edu.eduId === newItem.eduId)
        ),
      ];
      userEduData[userIndex].eduIng = mergedEdu;
    } else {
      // 신규 유저: 새 객체 생성
      const newUser = {
        idx: Date.now(), // 고유값
        uid: storedUser.uid,
        unm: storedUser.unm,
        umail: storedUser.eml,
        eduIng: newEduList,
      };
      userEduData.push(newUser);
    }

    localStorage.setItem("mypage-user-data", JSON.stringify(userEduData));

    const remaining = filteredCart.filter(
      (item) => !selectedItems.includes(item.idx)
    );
    updateCart(remaining);
    setSelectedItems([]);

    alert(
      `총 ${
        selectedCourses.length
      }개의 강의 결제 완료!\n결제 금액: ${formatPrice(totalPrice)}`
    );
    navigate("/mypage");
  };

  const selectedTotalPrice = useMemo(() => {
    return filteredCart
      .filter((item) => selectedItems.includes(item.idx))
      .reduce((sum, item) => sum + Number(item.gPrice), 0);
  }, [selectedItems, filteredCart]);

  return (
    <div className="cart-list-wrap">
      <h2>수강 바구니</h2>

      {filteredCart.length === 0 ? (
        <p className="empty-msg">장바구니가 비어 있습니다.</p>
      ) : (
        <>
          <div className="cart-controls">
            <label>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={selectedItems.length === filteredCart.length}
              />
              전체 선택
            </label>
            <button onClick={deleteSelected}>🗑 선택 삭제</button>
            <button onClick={clearCart}>🧹 전체 비우기</button>
          </div>

          <ul className="cart-list">
            {filteredCart.map((item) => (
              <li key={item.idx} className="cart-item">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.idx)}
                  onChange={() => toggleSelect(item.idx)}
                />
                <img
                  src={`${process.env.PUBLIC_URL}/images/edu_thumb/${item.idx}.png`}
                  alt={`강의 이미지 ${item.idx}`}
                  onClick={() => navigate(`/detail/${item.idx}`)}
                />
                <div className="item-info">
                  <h3>{item.gName}</h3>
                  <p>레벨: {item.gLevel}</p>
                  <p>가격: {formatPrice(item.gPrice)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <p>
              선택한 강의 수: <strong>{selectedItems.length}</strong>개
            </p>
            <p>
              총 결제금액: <strong>{formatPrice(selectedTotalPrice)}</strong>
            </p>
            <button className="checkout-btn" onClick={handleCheckout}>
              💳 결제하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartList;
