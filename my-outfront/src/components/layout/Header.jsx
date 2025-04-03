import {memo, useEffect} from "react";
import {Link} from "react-router-dom";
import "../../scss/header.scss";
import $ from "jquery";

const Header = memo(({goPage, loginSts, setLoginSts}) => {
  const categories = ["전체", "개발프로그래밍", "게임개발", "데이터사이언스", "인공지능", "보안네트워크", "기타"]; // 강의 카테고리

  useEffect(() => {
    // .main-category > li > a 클릭 시 형제 요소 ul에 .on 클래스 추가/제거
    $(".main-category > li > a").on("click", function (e) {
      
      // 현재 클릭된 a 요소의 형제 요소가 없는경우 a태그 기본 링크 동작하기
      if ($(this).next("ul").length === 0) {
        return;
      }

      e.preventDefault(); // a 태그 기본 동작 방지      

      // 현재 클릭된 a 요소의 부모(li) 안에 있는 ul을 선택
      const $currentUl = $(this).next("ul");

      // 모든 ul의 on 클래스를 제거하고, 현재 클릭된 ul에만 토글
      $(".main-category > li ul").not($currentUl).removeClass("on");
      $currentUl.toggleClass("on");

      $currentUl.find("li > a").on("click", function () {
        $currentUl.removeClass("on");
        // 클릭한 요소 부모 li css bold 처리
        $(this).parent().css("font-weight", "bold");
        // 클릭한 요소의 li의 형제 요소의 css bold 삭제
        

      });
      
    });

    // 이벤트 해제 처리
    return () => {
      $(".main-category > li > a").off("click");
    };
  }, []);

  // 리턴코드구역
  return (
    <header>
      <div className="header">
        <div className="logo">
          <h1>
            <a href={process.env.PUBLIC_URL}>
              <img src={`${process.env.PUBLIC_URL}/images/main/inflearn_logo.png`} alt="logo" />
            </a>
          </h1>
        </div>
        <div className="top-category">
          <ul className="main-category">
            <li>
              <a href="#">강의</a>
              <ul className="sub-category">
                {categories.map((category) => (
                  <li key={category}>
                    <a href={`${process.env.PUBLIC_URL}/#${category}`}>{category}</a>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link to="/board">커뮤니티</Link>
            </li>
          </ul>
        </div>
        <div className="member-menu">
          {!loginSts && (
            <ul>
              <li>
                <Link to="/login">로그인</Link>
              </li>
              <li>
                <Link to="/join">회원가입</Link>
              </li>
              <li>
                <Link to="/cartlist">장바구니</Link>
              </li>
            </ul>
          )}
          {loginSts && (
            <ul>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLoginSts(null);
                    sessionStorage.removeItem("minfo");
                    goPage("/");
                  }}
                  className="logout">
                  로그아웃
                </a>
              </li>
              <li>
                <Link to="/cartlist">
                  <i className="fa-solid fa-cart-shopping"></i>
                </Link>
              </li>
              <li>
                <Link to="/mypage">마이페이지</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
});

export {Header};
