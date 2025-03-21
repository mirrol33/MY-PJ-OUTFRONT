import {memo} from "react";
import {Link} from "react-router-dom";
import "../../scss/header.scss";

const Header = memo(({goPage, loginSts, setLoginSts}) => {

  const categories = ["전체", "개발프로그래밍", "게임개발", "데이터사이언스", "인공지능", "보안네트워크", "기타"]; // 강의 카테고리

  // 리턴코드구역
  return (
    <header>
      <div className="header">
        <div className="logo">
          <ul>
            <h1>
              <a href={process.env.PUBLIC_URL}>Logo</a>
            </h1>
          </ul>
        </div>
        <div className="top-category">
          <ul>
            <li>
              <a href={`${process.env.PUBLIC_URL}/#전체`}>강의</a>
              <ul>
                {categories.slice(1).map((category) => (
                  <li key={category}>
                    <a href={`${process.env.PUBLIC_URL}/#${category}`}>{category}</a>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <a href={`${process.env.PUBLIC_URL}/board`}>커뮤니티</a>
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
