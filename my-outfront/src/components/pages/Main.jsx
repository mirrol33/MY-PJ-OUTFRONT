// 메인 컴포넌트 ./src/components/pages/Main.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../scss/main.scss";
import eduData from "../../js/data/edu_data.json";

const Main = () => {
  const navigate = useNavigate(); // 강의 상세페이지 이동  
  const categories = ["전체", "개발프로그래밍", "게임개발", "데이터사이언스", "인공지능", "보안네트워크", "기타"]; // 강의 카테고리

  // 강의 해쉬태그 링크
  const getHashCategory = () => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    return categories.includes(hash) ? hash : "전체";
  };

  const [selCate, setSelCate] = useState(getHashCategory());  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleHashChange = () => {
      setSelCate(getHashCategory());
      setCurrentPage(1);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 가격 3자리수 콤마 추가
  const formatPrice = (price) => (Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`);

  // 강의 level 필터링
  const [levelFilter, setLevelFilter] = useState("all");

  let filteredList = selCate === "전체" ? eduData : eduData.filter(({ gCate }) => gCate === selCate);
  if (levelFilter !== "all") filteredList = filteredList.filter(({ gLevel }) => gLevel === levelFilter);

  // 강의 sort 정렬
  const [sortType, setSortType] = useState("default");

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortType === "name") return a.gName.localeCompare(b.gName, "ko-KR");
    if (sortType === "low-price") return a.gPrice - b.gPrice;
    if (sortType === "high-price") return b.gPrice - a.gPrice;
    return 0;
  });

  // 페이지네이션 적용
  const itemsPerPage = 15;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentList = sortedList.slice(startIdx, endIdx);
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleCategoryClick = (category) => {
    window.location.hash = category;
  };

  return (
    <div className="main-wrap">
      <h2>{selCate}</h2>
      <div className="sort-opt">
        <label>정렬</label>
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

      <ul className="edu-menu">
        {categories.map((category, i) => (
          <li key={category}>
            <button onClick={() => handleCategoryClick(category)} className={selCate === category ? "active" : ""}>
              <img src={`${process.env.PUBLIC_URL}/images/main/icon${i}.svg`} alt={category} />
              {category}
            </button>
          </li>
        ))}
      </ul>

      <ul className="list-wrap">
        {currentList.map((edu) => (
          <li key={edu.idx} className="edu-list" onClick={() => navigate(`/detail/${edu.idx}`)}>
            <picture>
              <img src={`${process.env.PUBLIC_URL}/images/edu_thumb/${edu.idx}.png`} alt={`강의 이미지 ${edu.idx}`} />
            </picture>
            <h3>{edu.gName}</h3>
            <p className="ginfo"> {edu.gInfo}</p>
            <p>레벨: {edu.gLevel}</p>
            <p>가격: {formatPrice(edu.gPrice)}</p>
            <p>분류: {edu.gCate}</p>
            {/* <a class="cart-btn" href="#none"><i class="fa-solid fa-cart-shopping"></i></a> */}
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="pagination">
          <ol>
            <li onClick={() => handlePageChange(1)} disabled={currentPage === 1}>⏮ 처음</li>
            <li onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>◀ 이전</li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i + 1} onClick={() => handlePageChange(i + 1)} className={i + 1 === currentPage ? "active" : ""}>
                {i + 1}
              </li>
            ))}
            <li onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>다음 ▶</li>
            <li onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>마지막 ⏭</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default Main;