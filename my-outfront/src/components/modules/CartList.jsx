import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../scss/pages/cartlist.scss";

function CartList() {
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });
  const [selectedItems, setSelectedItems] = useState([]);

  const navigate = useNavigate();

  // 가격 포맷 함수
  const formatPrice = (price) =>
    Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`;

  // 체크박스 선택/해제
  const toggleSelect = (idx) => {
    if (selectedItems.includes(idx)) {
      setSelectedItems(selectedItems.filter((id) => id !== idx));
    } else {
      setSelectedItems([...selectedItems, idx]);
    }
  };

  // 전체 선택
  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.idx));
    }
  };

  // 선택 항목 삭제
  const deleteSelected = () => {
    if (selectedItems.length === 0) return alert("선택된 항목이 없습니다.");
    const updatedCart = cart.filter((item) => !selectedItems.includes(item.idx));
    setCart(updatedCart);
    setSelectedItems([]);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // 전체 삭제
  const clearCart = () => {
    if (window.confirm("장바구니를 비우시겠습니까?")) {
      setCart([]);
      setSelectedItems([]);
      localStorage.removeItem("cart");
    }
  };

  // 결제하기
  const handleCheckout = () => {
    if (selectedItems.length === 0) return alert("결제할 항목을 선택하세요.");

    const selectedCourses = cart.filter((item) => selectedItems.includes(item.idx));
    const total = selectedCourses.reduce((sum, item) => sum + Number(item.gPrice), 0);

    alert(`총 ${selectedCourses.length}개의 강의를 결제합니다.\n결제 금액: ${formatPrice(total)}`);
    // 실제 결제 로직은 여기 추가 (결제 API 또는 이동 등)
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <div className="cart-list-wrap">
      <h2>🛒 장바구니</h2>

      {cart.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
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
              총 결제금액:{" "}
              <strong>
                {formatPrice(
                  cart
                    .filter((item) => selectedItems.includes(item.idx))
                    .reduce((sum, item) => sum + Number(item.gPrice), 0)
                )}
              </strong>
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
