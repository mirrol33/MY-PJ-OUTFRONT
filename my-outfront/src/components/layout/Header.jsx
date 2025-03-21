import {memo} from "react";
import {Link} from "react-router-dom";
import "../../scss/header.scss";

const Header = memo(({goPage, loginSts, setLoginSts}) => {

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
            </li>
            <li>
              <a href={`${process.env.PUBLIC_URL}/#개발프로그래밍`}>개발프로그래밍</a>
            </li>
            <li>
              <a href={`${process.env.PUBLIC_URL}/#게임개발`}>게임개발</a>
            </li>
            <li>
              <a href={`${process.env.PUBLIC_URL}/#인공지능`}>인공지능</a>
            </li>
            <li>
              <a href={`${process.env.PUBLIC_URL}/#보안네트워크`}>보안네트워크</a>
            </li>
            <li>
              <a href={`${process.env.PUBLIC_URL}/#기타`}>기타</a>
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
