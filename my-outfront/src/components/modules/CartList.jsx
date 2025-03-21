// CartList.jsx
import React, { useEffect, useState } from "react";
import "../../scss/pages/cart.scss";

// 수강 데이터 불러오기
import eduData from "../../js/data/edu_data.json";

import { Link } from "react-router-dom";

const CartList = ({}) => {
  const [userInfo, setUserInfo] = useState(null); // 로그인한 사용자 정보
  const [cartItem, setCartItem] = useState(eduData);
  const formatPrice = (price) => (Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`);
  const [selectedItems, setSelectedItems] = useState(new Array(cartItem.length).fill(false));

  useEffect(() => {
    // 세션 스토리지에서 로그인한 사용자 정보 가져오기
    const storedUser = sessionStorage.getItem("minfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);
    }
  }, []);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked; // 전체 선택 체크박스 상태
    setSelectedItems(new Array(cartItem.length).fill(isChecked));
  };

  const handleCheckboxChange = (index) => {
    const updatedSelectedItems = [...selectedItems];
    updatedSelectedItems[index] = !updatedSelectedItems[index]; // 체크박스 상태 토글
    setSelectedItems(updatedSelectedItems);
  };

  // 선택된 항목 수 계산
  const selectedCount = selectedItems.filter(Boolean).length; // true 값의 수를 세어 선택된 항목 수를 계산

  const handleDeleteSelected = () => {
    const updatedCartItems = cartItem.filter((_, index) => !selectedItems[index]); // 선택되지 않은 항목만 남김
    setCartItem(updatedCartItems); // 업데이트된 항목으로 상태 변경
    setSelectedItems(new Array(updatedCartItems.length).fill(false)); // 선택 상태 초기화
  };

  return (
    <>
      <div className="basket-container">
        <h2 className="basket-title">✨ {userInfo ? `${userInfo.unm}님의 수강바구니 ✨` : "수강바구니"}</h2>

        <div className="basket-wrap">
          {cartItem.length === 0 ? ( // cartItem이 비어 있는 경우
            <div className="empty-cart">
              <p>담긴 강의가 없습니다.</p>
              <Link to="/" className="border-box">
                담으러 가기 🧺
              </Link>
            </div>
          ) : (
            <>
              <div className="basket-list">
                <div className="basket-select">
                  <div className="select-box">
                    <input
                      type="checkbox"
                      className="checkbtn"
                      onChange={handleSelectAllChange} // 전체 선택 체크박스 변경 핸들러
                      checked={selectedCount === cartItem.length}
                    />
                    <div className="select-title">
                      <p className="select-txt">전체선택</p>
                      <p className="select-num">
                        <span>{selectedCount}</span>/{cartItem.length}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="border-box" onClick={handleDeleteSelected}>
                    선택삭제
                  </button>
                </div>
                <div className="edu-list-container">
                  {cartItem.map((item, index) => (
                    <div className="edu-list-wrap" key={item.id}>
                      <div className="edu-list-left">
                        <input
                          type="checkbox"
                          className="checkbtn"
                          checked={selectedItems[index]}
                          onChange={() => handleCheckboxChange(index)}
                        />
                        <img
                          src={`./images/edu_thumb/${item.idx}.png`}
                          alt={`강의 이미지 ${item.idx}`}
                          className="edu-img"
                        />
                        <div className="box">
                          <ul className="text-box">
                            <li className="gname">{item.gName}</li>
                            <ol className="cat-box">
                              <li className="glavel">{item.gLevel}</li>
                              <li className="gdate">{item.gDate}</li>
                            </ol>
                          </ul>
                          <h4>{formatPrice(item.gPrice)}</h4>
                        </div>
                      </div>
                      <div className="edu-list-right">
                        <h4>{formatPrice(item.gPrice)}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pay-list">
            <div className="pay-title">
              <h5>구매자정보</h5>
              <Link to="/mypage" className="border-box">
                수정
              </Link>
            </div>
            <div className="horizon"></div>
            <div className="user-desc">
              <div className="user">
                <p className="user-title">아이디</p>
                <p className="user-desc">{userInfo ? userInfo.uid : "비회원 상태입니다."}</p>
              </div>
              <div className="user">
                <p className="user-title">이름</p>
                <p className="user-desc">{userInfo ? userInfo.unm : "비회원 상태입니다."}</p>
              </div>
              <div className="user">
                <p className="user-title">이메일</p>
                <p className="user-desc">{userInfo ? userInfo.eml : "비회원 상태입니다."}</p>
              </div>
            </div>
            <div className="horizon"></div>
            <div className="total-price">
              <div className="total-desc">
                <p>총 결제금액</p>
                <span>가격불러오기</span>
              </div>
              <button className="submit">결제하기</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartList;
