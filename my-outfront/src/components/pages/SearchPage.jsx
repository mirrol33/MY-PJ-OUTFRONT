import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import eduData from "../../js/data/edu_data.json";
import "../../scss/pages/search.scss";

/********************************************************
 * [ 요구사항 ]
[v] 데스크탑버전에서 검색하면 검색결과에 맞는 사진이 나와야 함 (edu_data.json -> idx)
[v] 모바일버전에서 검색하면 드롭창이 자동으로 닫히고 결과가 보여야 함
[v] 검색결과가 없을 경우에는 "검색어를 확인해주세요" 문구 노출
[v] 다시 찾아보기 클릭 시 서치바에 포커스 이동
********************************************************/

const SearchPage = () => {
  const { state } = useLocation();
  const keyword = state ? state.keyword : "";
  const navigate = useNavigate();

  // 검색결과 필터링
  const selData = eduData.filter((v) => {
    // 대소문자를 구분하지 않기 위해 모두 소문자로 변환
    const lowerKeyword = keyword.toLowerCase();
    return (
      v.gName.toLowerCase().includes(lowerKeyword) || 
      v.gInfo.toLowerCase().includes(lowerKeyword)
    );
  });

  // 가격형식 변환 함수
  const formatPrice = (price) => (Number(price) === 0 ? "무료" : `₩${Number(price).toLocaleString()}`);

  // 장바구니 버튼 클릭 핸들러
  const cartBtnFn = (e) => {
    const el = e.currentTarget;
    console.log("장바구니 버튼 클릭!", el);
  };

  return (
    <div className="search-result">
      {keyword === "" ? ( // 검색어가 비어있을 경우
        <div className="message-container">
          <div className="img-box">
            <img src="../../images/common/bono.png" alt="에러메세지" />
          </div>
          <h4 className="none-title">검색어를 확인해주세요.</h4>
          <button className="research"
          onClick={()=>{
            document.querySelector('.mobile-gnb-button').click();
            document.querySelector('.search-input').focus();
          }}
          >다시 찾아보기</button>
        </div>
      ) : selData.length === 0 ? ( // 검색 결과가 없을 경우
        <div className="message-container">
        <div className="img-box">
          <img src="../../images/common/bono.png" alt="에러메세지" />
        </div>
        <h4 className="none-title"><span>"{keyword}"</span>의 검색결과가 존재하지 않습니다.</h4>
        <p className="none-desc">열심히 찾아서 준비할게요...</p>
        <button className="research"
        onClick={()=>{
          document.querySelector('.mobile-gnb-button').click();
          document.querySelector('.search-input').focus();
        }}
        >다시 찾아보기</button>
      </div>
      ) : (
        <>
          <h3 className="search-title">
            <span>"{keyword}"</span>의 검색결과입니다.
          </h3>
          <section className="search-wrap">
            {selData.map((v) => (
              <div key={v.idx} className="search-edu" onClick={() => navigate(`/detail/${v.idx}`)}>
                <div className="search-image">
                  <img src={`./images/edu_thumb/${v.idx}.png`} alt={`강의 이미지 ${v.gName}`} />
                </div>
                <h3 className="search-tit">{v.gName}</h3>
                <p className="search-desc">설명: {v.gInfo}</p>
                <p>레벨: {v.gLevel}</p>
                <p>가격: {formatPrice(v.gPrice)}</p>
                <p>분류: {v.gSkill}</p>
                <a className="cart-btn" onClick={cartBtnFn} href="#none">
                  <i className="fa-solid fa-cart-shopping"></i>
                </a>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default SearchPage;
