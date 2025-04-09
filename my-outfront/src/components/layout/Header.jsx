// 헤더영역 컴포넌트 : Header.jsx
import { memo, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../scss/header.scss";
import { CartContext } from "../modules/CartContext";

const categories = [
  "전체",
  "개발프로그래밍",
  "게임개발",
  "데이터사이언스",
  "인공지능",
  "보안네트워크",
  "기타",
];

const Header = memo(({ goPage, loginSts, setLoginSts }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSubOpen, setIsSubOpen] = useState(false);
  const subMenuRef = useRef(null);
  const { cartCount } = useContext(CartContext);
  const publicUrl = process.env.PUBLIC_URL;

  // 외부 클릭 시 서브메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (subMenuRef.current && !subMenuRef.current.contains(e.target)) {
        setIsSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색 실행
  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    if (!keyword) return;
    goPage("search", { state: { keyword } });
  };

  // 로그아웃 처리
  const handleLogout = (e) => {
    e.preventDefault();
    setLoginSts(null);
    sessionStorage.removeItem("minfo");
    goPage("/");
  };

  // 유저 메뉴 렌더링
  const renderUserMenu = () => (
    <>
      {loginSts ? (
        <li>
          <a href="#" onClick={handleLogout} className="logout">
            <i className="fa-solid fa-arrow-up-from-bracket" title="로그아웃"></i>
          </a>
        </li>
      ) : (
        <>
          <li>
            <Link to="/login">
              <i className="fa-solid fa-arrow-right-to-bracket" title="로그인"></i>
            </Link>
          </li>
          <li>
            <Link to="/join">
              <i className="fa-solid fa-user-plus" title="회원가입"></i>
            </Link>
          </li>
        </>
      )}
      <li>
        <Link to="/mypage">
          <i className="fa-solid fa-user" title="마이페이지"></i>
        </Link>
      </li>
      <li className="cart-area">
        <Link to="/cartlist">
          <i className="fa-solid fa-cart-shopping" title="수강바구니"></i>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
      </li>
    </>
  );

  return (
    <header>
      <div className="header">
        <ul>
          <li>
            <h1 className="logo">
              <a href={publicUrl}>
                <img
                  src={`${publicUrl}/images/main/inflearn_logo.png`}
                  alt="logo"
                />
              </a>
            </h1>
          </li>

          <li className="top-category">
            <ul className="main-category">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSubOpen((prev) => !prev);
                  }}
                >
                  강의
                </a>
              </li>
              <li>
                <Link to="/board">커뮤니티</Link>
              </li>
            </ul>

            {isSubOpen && (
              <ul
                className="sub-category on"
                ref={subMenuRef}
                onMouseLeave={() => setIsSubOpen(false)}
              >
                {categories.map((category) => (
                  <li key={category}>
                    <a href={`${publicUrl}/#${category}`}>{category}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="member-nav">
            <ul>{renderUserMenu()}</ul>
          </li>

          <li className="search-area">
            <input
              className="search"
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="sbtn" onClick={handleSearch}>
              검색
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
});

export { Header };
