// Main.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../modules/CartContext";
import "../../scss/main.scss";
import eduData from "../../js/data/edu_data.json";



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
  const {
    cart,
    addToCart,
    isInCart,
    filterCartWithUserData,
  } = useCart();

  const [selCate, setSelCate] = useState(() => getHashCategory());
  const [currentPage, setCurrentPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortType, setSortType] = useState("default");
  
  // 해시 변경 감지 + 필터된 장바구니 초기 설정
  useEffect(() => {
    filterCartWithUserData(); // 로그인 사용자 학습 중인 강의 제외

    const handleHashChange = () => {
      const newCate = getHashCategory();
      if (newCate !== selCate) {
        setSelCate(newCate);
        setCurrentPage(1);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [selCate, filterCartWithUserData]);

  const formatPrice = (price) =>
    Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`;

  const getFilteredAndSortedData = useCallback(() => {
    let list =
      selCate === "전체"
        ? eduData
        : eduData.filter(({ gCate }) => gCate === selCate);

    if (levelFilter !== "all") {
      list = list.filter(({ gLevel }) => gLevel === levelFilter);
    }

    return list.sort((a, b) => {
      if (sortType === "name") return a.gName.localeCompare(b.gName, "ko-KR");
      if (sortType === "low-price") return a.gPrice - b.gPrice;
      if (sortType === "high-price") return b.gPrice - a.gPrice;
      return 0;
    });
  }, [selCate, levelFilter, sortType]);

  const sortedList = getFilteredAndSortedData();
  const itemsPerPage = 15;
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);
  const currentList = sortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
            <option value="default">기본 정렬</option>
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
          <li key={edu.idx} className="edu-list">
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
                <i
                  className={`fa-solid fa-cart-shopping ${
                    isInCart(edu.idx) ? "on" : ""
                  }`}
                ></i>
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
              style={{ display: currentPage === 1 ? "none" : "inline-block" }}
            >
              <i className="fa-solid fa-backward"></i>
            </li>
            <li
              onClick={() => handlePageChange(currentPage - 1)}
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
              style={{
                display: currentPage === totalPages ? "none" : "inline-block",
              }}
            >
              <i className="fa-solid fa-arrow-right"></i>
            </li>
            <li
              onClick={() => handlePageChange(totalPages)}
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
