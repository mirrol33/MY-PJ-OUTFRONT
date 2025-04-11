import { memo, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../scss/header.scss";
import { CartContext } from "../modules/CartContext";

const eduCate = [
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
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const subMenuRef = useRef(null);
  const publicUrl = process.env.PUBLIC_URL;
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const closeAside = () => setIsAsideOpen(false);
  const toggleAside = () => setIsAsideOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 1000;
      setIsMobile(isNowMobile);
      if (!isNowMobile) {
        setIsAsideOpen(false);
        setIsSubOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (subMenuRef.current && !subMenuRef.current.contains(e.target)) {
        setIsSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    if (!keyword) return;
    goPage("search", { state: { keyword } });
    closeAside();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("minfo");
    setLoginSts(null);
    navigate("/");
    closeAside();
  };

  const handleCategoryClick = (category) => {
    window.location.href = `${publicUrl}/#${category}`;
    closeAside();
  };

  const handleLectureMenuEvent = (eventType) => {
    if (!isMobile) {
      if (eventType === "enter") setIsSubOpen(true);
      if (eventType === "leave") setIsSubOpen(false);
    }
  };

  const renderUserMenu = () => (
    <>
      {loginSts ? (
        <>
          <li>
            <a href="#" onClick={handleLogout} className="logout">
              <i
                className="fa-solid fa-arrow-up-from-bracket"
                title="로그아웃"
              ></i>
            </a>
          </li>
          <li>
            <Link to="/myedu" onClick={closeAside}>
              <i className="fa-solid fa-play" title="내 강의"></i>
            </Link>
          </li>
        </>
      ) : (
        <>
          <li>
            <Link to="/login" onClick={closeAside}>
              <i
                className="fa-solid fa-arrow-right-to-bracket"
                title="로그인"
              ></i>
            </Link>
          </li>
          <li>
            <Link to="/join" onClick={closeAside}>
              <i className="fa-solid fa-user-plus" title="회원가입"></i>
            </Link>
          </li>
        </>
      )}
      <li>
        <Link to="/mypage" onClick={closeAside}>
          <i className="fa-solid fa-user" title="마이페이지"></i>
        </Link>
      </li>
      <li className="cart-area">
        <Link to="/cartlist" onClick={closeAside}>
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
              <Link to="/">
                <img
                  src={`${publicUrl}/images/main/inflearn_logo.png`}
                  alt="logo"
                />
              </Link>
            </h1>
          </li>

          <li className="ham-menu">
            <button onClick={toggleAside}>
              <img
                src={`${publicUrl}/images/main/ham_menu.svg`}
                alt="ham-menu"
              />
            </button>
          </li>

          <div
            className={`overlay ${isAsideOpen ? "open" : ""}`}
            onClick={closeAside}
          ></div>

          <div className={`aside-toggle ${isAsideOpen ? "open" : ""}`}>
            <li className="search-area">
              <input
                className="search"
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="sbtn" onClick={handleSearch} title="검색">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>

              <button className="sbtn close" onClick={closeAside}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </li>

            <li className="member-nav">
              <ul>{renderUserMenu()}</ul>
            </li>

            <li className="top-category">
              <ul className="main-category">
                <li
                  onMouseEnter={() => handleLectureMenuEvent("enter")}
                  ref={subMenuRef}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isMobile) setIsSubOpen((prev) => !prev);
                    }}
                  >
                    강의
                  </a>
                </li>
                <li>
                  <Link to="/board" onClick={closeAside}>
                    커뮤니티
                  </Link>
                </li>
              </ul>

              {isSubOpen && (
                <ul
                  className="sub-category on"
                  onMouseLeave={() => handleLectureMenuEvent("leave")}
                  ref={subMenuRef}
                >
                  {eduCate.map((category,i) => (
                    <li key={i}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategoryClick(category);
                        }}
                      >
                        {category}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </div>
        </ul>
      </div>
    </header>
  );
});

export { Header };
