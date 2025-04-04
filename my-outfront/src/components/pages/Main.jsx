import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../scss/main.scss";
import eduData from "../../js/data/edu_data.json";
import $ from "jquery";

const categories = [
  "전체",
  "개발프로그래밍",
  "게임개발",
  "데이터사이언스",
  "인공지능",
  "보안네트워크",
  "기타",
];

const getHashCategory = () => {
  const hash = decodeURIComponent(window.location.hash.replace("#", ""));
  return categories.includes(hash) ? hash : "전체";
};

const Main = () => {
  const navigate = useNavigate();
  const [selCate, setSelCate] = useState(() => getHashCategory());
  const [currentPage, setCurrentPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [cart, setCart] = useState([]);

  // URL 해시 변경 감지
  useEffect(() => {
    const handleHashChange = () => {
      setSelCate(getHashCategory());
      setCurrentPage(1);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 가격 포맷 함수
  const formatPrice = (price) =>
    Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`;

  // 필터 및 정렬 적용된 데이터 반환
  const getFilteredAndSortedData = useCallback(() => {
    let list =
      selCate === "전체"
        ? eduData
        : eduData.filter(({ gCate }) => gCate === selCate);
    if (levelFilter !== "all")
      list = list.filter(({ gLevel }) => gLevel === levelFilter);

    return list.sort((a, b) => {
      if (sortType === "name") return a.gName.localeCompare(b.gName, "ko-KR");
      if (sortType === "low-price") return a.gPrice - b.gPrice;
      if (sortType === "high-price") return b.gPrice - a.gPrice;
      return 0;
    });
  }, [selCate, levelFilter, sortType]);

  // 페이지네이션 로직
  const sortedList = getFilteredAndSortedData();
  const itemsPerPage = 15;
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);
  const currentList = sortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage) setCurrentPage(newPage);
  };

  /// ✅ 장바구니 데이터 로드
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    // 🏷️ 기존 장바구니에 있던 강의의 아이콘에 .on 추가
    storedCart.forEach((edu) => {
      $(`#edu-${edu.idx} .cart-btn i`).addClass("on");
    });
  }, []);

  // ✅ 장바구니에 해당 강의가 있는지 확인
  const isInCart = (idx) => cart.some((item) => item.idx === idx);

  // ✅ 장바구니 추가/삭제 함수
  const addToCart = (e, edu) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedCart = [...cart];

    if (isInCart(edu.idx)) {
      // ❌ 장바구니에서 제거
      updatedCart = updatedCart.filter((item) => item.idx !== edu.idx);
      alert("장바구니에서 삭제되었습니다!");
    } else {
      // ✅ 장바구니에 추가
      updatedCart.push(edu);
      alert("장바구니에 추가되었습니다!");
    }

    // 📝 로컬스토리지 업데이트 & 상태 변경
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);

    // 🎨 아이콘 클래스 토글
    $(e.currentTarget).find("i").toggleClass("on", !isInCart(edu.idx));
  };
  
  // 리턴 코드구역 ////
  return (
    <div className="main-wrap">
      <h2>{selCate}</h2>
      <div className="edu-menu-wrap">
        <ul className="edu-menu">
          {categories.map((category, i) => (
            <li key={category}>
              <button
                onClick={() => (window.location.hash = category)}
                className={selCate === category ? "active" : ""}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/images/main/icon${i}.svg`}
                  alt={category}
                />
                {category}
              </button>
            </li>
          ))}
        </ul>
        <div className="sort-opt">
          <label>정렬</label>
          <select
            onChange={(e) => setSortType(e.target.value)}
            value={sortType}
          >
            <option value="default">전체 정렬</option>
            <option value="name">이름순 (가나다 순)</option>
            <option value="low-price">가격 낮은 순</option>
            <option value="high-price">가격 높은 순</option>
          </select>
          <select
            onChange={(e) => setLevelFilter(e.target.value)}
            value={levelFilter}
          >
            <option value="all">전체 레벨</option>
            <option value="입문">입문</option>
            <option value="초급">초급</option>
            <option value="중급">중급</option>
            <option value="고급">고급</option>
          </select>
        </div>
      </div>
      <ul className="list-wrap">
        {currentList.map((edu) => (
          <li key={edu.idx} id={`edu-${edu.idx}`} className="edu-list">
            <picture onClick={() => navigate(`/detail/${edu.idx}`)}>
              <img
                src={`${process.env.PUBLIC_URL}/images/edu_thumb/${edu.idx}.png`}
                alt={`강의이미지${edu.idx}`}
              />
            </picture>
            <h3>{edu.gName}</h3>
            <p className="ginfo"> {edu.gInfo}</p>
            <p>레벨: {edu.gLevel}</p>
            <p>가격: {formatPrice(edu.gPrice)}</p>
            <p>분류: {edu.gCate}</p>
            <div className="list-btns">
              <a
                className="cart-btn"
                href="#"
                onClick={(e) => addToCart(e, edu)}
              >
                <i className="fa-solid fa-cart-shopping"></i>
              </a>
              <a className="heart-btn" href="#none">
                <i className="fa-solid fa-heart"></i>
              </a>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="pagination">
          <ol>
            <li
              onClick={() => handlePageChange(1)}
              className={currentPage === 1 ? "disabled" : ""}
              style={{ display: currentPage === 1 ? "none" : "inline-block" }}
            >
              <i className="fa-solid fa-backward"></i>
            </li>
            <li
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "disabled" : ""}
              style={{ display: currentPage === 1 ? "none" : "inline-block" }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={i + 1 === currentPage ? "active" : ""}
              >
                {i + 1}
              </li>
            ))}
            <li
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "disabled" : ""}
              style={{
                display: currentPage === totalPages ? "none" : "inline-block",
              }}
            >
              <i className="fa-solid fa-arrow-right"></i>
            </li>
            <li
              onClick={() => handlePageChange(totalPages)}
              className={currentPage === totalPages ? "disabled" : ""}
              style={{
                display: currentPage === totalPages ? "none" : "inline-block",
              }}
            >
              <i className="fa-solid fa-forward"></i>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default Main;
