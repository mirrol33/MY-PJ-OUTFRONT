// CartList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../scss/pages/cartlist.scss";

function CartList() {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  // 사용자 로그인 정보 및 장바구니 필터링
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("minfo"));
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!storedUser) {
      setCart(storedCart);
      return;
    }

    const userEduData = JSON.parse(localStorage.getItem("mypage-user-data")) || [];
    const currentUser = userEduData.find((u) => u.uid === storedUser.uid);

    const filteredCart =
      currentUser?.eduIng?.length > 0
        ? storedCart.filter(
            (item) => !currentUser.eduIng.some((edu) => edu.eduId === item.idx)
          )
        : storedCart;

    setCart(filteredCart);
    localStorage.setItem("cart", JSON.stringify(filteredCart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  // 장바구니 변경 시 로컬 저장
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 가격 포맷
  const formatPrice = (price) =>
    Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`;

  // 선택 토글
  const toggleSelect = (idx) => {
    setSelectedItems((prev) =>
      prev.includes(idx) ? prev.filter((id) => id !== idx) : [...prev, idx]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(selectedItems.length === cart.length ? [] : cart.map((item) => item.idx));
  };

  const deleteSelected = () => {
    if (selectedItems.length === 0) return alert("선택된 항목이 없습니다.");
    const updated = cart.filter((item) => !selectedItems.includes(item.idx));
    setCart(updated);
    setSelectedItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearCart = () => {
    if (window.confirm("장바구니를 비우시겠습니까?")) {
      setCart([]);
      setSelectedItems([]);
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return alert("결제할 항목을 선택하세요.");

    const selectedCourses = cart.filter((item) => selectedItems.includes(item.idx));
    const total = selectedCourses.reduce((sum, item) => sum + Number(item.gPrice), 0);

    alert(`총 ${selectedCourses.length}개의 강의를 결제합니다.\n결제 금액: ${formatPrice(total)}`);
    // TODO: 결제 로직 연동
  };

  const selectedTotalPrice = useMemo(() => {
    return cart
      .filter((item) => selectedItems.includes(item.idx))
      .reduce((sum, item) => sum + Number(item.gPrice), 0);
  }, [selectedItems, cart]);

  return (
    <div className="cart-list-wrap">
      <h2>수강 바구니</h2>

      {cart.length === 0 ? (
        <p className="empty-msg">장바구니가 비어 있습니다.</p>
      ) : (
        <>
          <div className="cart-controls">
            <label>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={selectedItems.length === cart.length}
              />
              전체 선택
            </label>
            <button onClick={deleteSelected}>🗑 선택 삭제</button>
            <button onClick={clearCart}>🧹 전체 비우기</button>
          </div>

          <ul className="cart-list">
            {cart.map((item) => (
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
