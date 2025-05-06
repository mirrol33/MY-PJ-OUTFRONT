// Main.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../modules/CartContext";
import "../../scss/main.scss";
import eduData from "../../js/data/edu_data.json";
import eduCate from "../../js/edu_cate.js";

// 현재 해시값을 카테고리로 변환
const getHashCategory = () => {
  const hash = decodeURIComponent(window.location.hash.replace("#", ""));
  return eduCate.includes(hash) ? hash : "전체";
};

const Main = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart, filterCartWithUserData } = useCart();

  // 상태 초기화
  const [selCate, setSelCate] = useState(() => getHashCategory());
  const [currentPage, setCurrentPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortType, setSortType] = useState("default");

  // 페이지당 아이템 수
  const itemsPerPage = 10;

  // 로그인된 사용자에 맞게 장바구니 필터링 + 해시 변경 감지
  useEffect(() => {
    filterCartWithUserData();

    const handleHashChange = () => {
      const newCate = getHashCategory();
      if (newCate !== selCate) {
        setSelCate(newCate);
        setCurrentPage(1); // 카테고리 바뀌면 페이지 초기화
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [selCate, filterCartWithUserData]);

  // 가격 포맷팅 함수
  const formatPrice = (price) =>
    Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`;

  // 카테고리, 레벨, 정렬 기준으로 필터링/정렬된 데이터 반환
  const getFilteredAndSortedData = useCallback(() => {
    let list = selCate === "전체"
      ? eduData
      : eduData.filter(({ gCate }) => gCate === selCate);

    if (levelFilter !== "all") {
      list = list.filter(({ gLevel }) => gLevel === levelFilter);
    }

    switch (sortType) {
      case "name":
        return [...list].sort((a, b) =>
          a.gName.localeCompare(b.gName, "ko-KR")
        );
      case "low-price":
        return [...list].sort((a, b) => a.gPrice - b.gPrice);
      case "high-price":
        return [...list].sort((a, b) => b.gPrice - a.gPrice);
      default:
        return list;
    }
  }, [selCate, levelFilter, sortType]);

  const sortedList = getFilteredAndSortedData();
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);
  const currentList = sortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 페이지네이션 관련
  const handlePageChange = useCallback((newPage) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [currentPage, totalPages]);

  const pageGroupSize = 3;
  const currentGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  return (
    <div className="main-wrap">
      <h2>{selCate}</h2>

      {/* 카테고리 메뉴 */}
      <div className="edu-menu-wrap">
        <ul className="edu-menu">
          {eduCate.map((category, i) => (
            <li key={i}>
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

        {/* 정렬 및 레벨 필터 */}
        <div className="sort-opt">
          <select onChange={(e) => setSortType(e.target.value)} value={sortType}>
            <option value="default">기본 정렬</option>
            <option value="name">이름순 (가나다 순)</option>
            <option value="low-price">가격 낮은 순</option>
            <option value="high-price">가격 높은 순</option>
          </select>
          <select onChange={(e) => setLevelFilter(e.target.value)} value={levelFilter}>
            <option value="all">전체 레벨</option>
            <option value="입문">입문</option>
            <option value="초급">초급</option>
            <option value="중급">중급</option>
            <option value="고급">고급</option>
          </select>
        </div>
      </div>

      {/* 강의 리스트 출력 */}
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
            <p className="ginfo">{edu.gInfo}</p>
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
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <ol>
            {currentGroup > 1 && (
              <li onClick={() => handlePageChange(1)}>
                <i className="fa-solid fa-backward"></i>
              </li>
            )}
            {currentPage > 1 && (
              <li onClick={() => handlePageChange(currentPage - 1)}>
                <i className="fa-solid fa-arrow-left"></i>
              </li>
            )}
            {[...Array(endPage - startPage + 1)].map((_, i) => {
              const pageNum = startPage + i;
              return (
                <li
                  key={pageNum}
                  className={pageNum === currentPage ? "active" : ""}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </li>
              );
            })}
            {currentPage < totalPages && (
              <li onClick={() => handlePageChange(currentPage + 1)}>
                <i className="fa-solid fa-arrow-right"></i>
              </li>
            )}
            {endPage < totalPages && (
              <li onClick={() => handlePageChange(totalPages)}>
                <i className="fa-solid fa-forward"></i>
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Main;
