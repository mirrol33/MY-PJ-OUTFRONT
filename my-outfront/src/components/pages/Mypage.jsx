// Mypage.jsx

import React, { useContext, useEffect, useMemo, useState } from "react";
import "../../scss/mypage.scss";
import { Link, useNavigate } from "react-router-dom";
import userData from "../../js/data/user_data.json";
import reviewData from "../../js/data/review_data.json";
import { CartContext } from "../modules/CartContext";

// 프로필 이미지 컴포넌트
const ProfileImage = ({ profileImg, onChange }) => (
  <div>
    <label htmlFor="profile-upload">
      <picture>
        <img src={profileImg} alt="profile" />
        <span>
          <i className="fa-solid fa-image"></i>
        </span>
      </picture>
    </label>
    <input
      type="file"
      id="profile-upload"
      accept="image/*"
      style={{ display: "none" }}
      onChange={onChange}
    />
  </div>
);

const Mypage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newReview, setNewReview] = useState({
    grade: 0.5,
    text: "수강 후기를 작성해주세요",
  });
  const [profileImg, setProfileImg] = useState("./images/mypage/1.png");

  const { updateCart } = useContext(CartContext);
  const [eduList, setEduList] = useState([]);
  const [boardList, setBoardList] = useState([]);

  // 마운트 시 데이터 로딩
  useEffect(() => {
    const minfo = JSON.parse(sessionStorage.getItem("minfo"));
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    let storedUserData = JSON.parse(localStorage.getItem("mypage-user-data"));
    const storedReviews =
      JSON.parse(localStorage.getItem("review-data")) || reviewData;
    const storedBoard = JSON.parse(localStorage.getItem("board-data")) || [];

    if (!storedUserData) {
      localStorage.setItem("mypage-user-data", JSON.stringify(userData));
      storedUserData = userData;
    }

    setReviewList(storedReviews);

    if (minfo) {
      setUserInfo(minfo);
      const currentUser = storedUserData.find((user) => user.uid === minfo.uid);
      const eduIng = currentUser?.eduIng || [];

      // ✅ mypage-user-data 기준으로 이미지 설정
      setProfileImg(currentUser?.profileImg || "./images/mypage/1.png");
      console.log(
        "✅ 로그인 유저 프로필 이미지 설정됨:",
        currentUser?.profileImg
      );

      // 학습 강의 장바구니에서 제거
      const learningIds = eduIng.map((edu) => edu.eduId);
      const removedItems = storedCart.filter((item) =>
        learningIds.includes(item.idx)
      );
      const filteredCart = storedCart.filter(
        (item) => !learningIds.includes(item.idx)
      );

      updateCart(filteredCart);

      if (removedItems.length > 0) {
        const removedNames = removedItems
          .map((item) => `"${item.idx}"`)
          .join(", ");
        alert(
          `이미 학습 중인 강의는 장바구니에서 제거되었습니다: ${removedNames}`
        );
      }

      setEduList(eduIng);
      setBoardList(storedBoard.filter((post) => post.uid === minfo.uid));
    } else {
      // 로그아웃 시 기본 이미지로 초기화
      setProfileImg("./images/mypage/1.png");
      console.log("🚪 로그아웃 상태 - 프로필 이미지 초기화됨.");
    }
  }, []);

  const memoizedBoardList = useMemo(() => boardList, [boardList]);
  const memoizedUserEduList = useMemo(() => eduList, [eduList]);

  // 수강평 팝업 열기
  const openReviewPopup = (eduId) => {
    console.log("📌 수강평 팝업 열기 - eduId:", eduId);

    const userReview = reviewList.find(
      (review) => review.uid === userInfo.uid && review.eduId === eduId
    );

    setSelectedReview({ eduId, uid: userInfo.uid });
    setNewReview(
      userReview
        ? { grade: userReview.grade, text: userReview.text }
        : { grade: 0.5, text: "수강 후기를 작성해주세요" }
    );
    setShowPopup(true);
  };

  const closePopup = () => {
    console.log("❎ 수강평 팝업 닫기");
    setShowPopup(false);
    setSelectedReview(null);
    setNewReview({ grade: 0.5, text: "수강 후기를 작성해주세요" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("🖊️ 수강평 입력 변경 -", name, value);

    setNewReview((prev) => ({
      ...prev,
      [name]: name === "grade" ? parseFloat(value) : value,
    }));
  };

  const saveReview = () => {
    console.log("💾 수강평 저장 시도");
    const updatedReview = {
      ...newReview,
      uid: userInfo.uid,
      name: userInfo.unm,
      eduId: selectedReview.eduId,
    };

    const updatedList = [...reviewList];
    const existingIndex = updatedList.findIndex(
      (review) =>
        review.uid === userInfo.uid && review.eduId === selectedReview.eduId
    );

    if (existingIndex !== -1) {
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        ...updatedReview,
      };
      console.log("✏️ 기존 수강평 수정:", updatedReview);
    } else {
      const newIdx =
        updatedList.length > 0
          ? updatedList[updatedList.length - 1].idx + 1
          : 1;
      updatedList.push({ ...updatedReview, idx: newIdx });
      console.log("🆕 새 수강평 추가:", updatedReview);
    }

    setReviewList(updatedList);
    localStorage.setItem("review-data", JSON.stringify(updatedList));
    alert("수강평이 저장되었습니다!");
    closePopup();
  };

  const handleProfileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png", "gif"].includes(ext)) {
      alert("이미지 파일(jpg, jpeg, png, gif)만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("이미지 크기가 2MB를 초과했습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = e.target.result;
      setProfileImg(img);
      console.log("🖼️ 새로운 프로필 이미지 미리보기 설정됨");

      // ✅ 로그인한 유저의 프로필 이미지 데이터 갱신
      const minfo = JSON.parse(sessionStorage.getItem("minfo"));
      let storedUserData = JSON.parse(localStorage.getItem("mypage-user-data"));

      if (minfo && storedUserData) {
        const updatedUserData = storedUserData.map((user) =>
          user.uid === minfo.uid ? { ...user, profileImg: img } : user
        );
        localStorage.setItem(
          "mypage-user-data",
          JSON.stringify(updatedUserData)
        );
        console.log(
          "💾 로컬스토리지 mypage-user-data에 프로필 이미지 반영 완료"
        );
      }
    };

    reader.readAsDataURL(file);
  };

  // 수강평 삭제
  const deleteReview = () => {
    if (!selectedReview) return;
    console.log("🗑️ 수강평 삭제 -", selectedReview);

    const updatedList = reviewList.filter(
      (review) =>
        !(
          review.uid === selectedReview.uid &&
          review.eduId === selectedReview.eduId
        )
    );

    setReviewList(updatedList);
    localStorage.setItem("review-data", JSON.stringify(updatedList));
    alert("수강평이 삭제되었습니다.");
    closePopup();
  };

  return (
    <div className="mypage-wrap">
      <div className="mypage-top">
        <h2>{userInfo ? `${userInfo.unm}님의 마이페이지` : "마이페이지"}</h2>
        <ProfileImage profileImg={profileImg} onChange={handleProfileChange} />
        <span>ID : {userInfo?.uid || "로그인 필요!"}</span>
        <p>
          <b>{userInfo?.unm || "비회원"}</b>님 😎 <b>아웃프런</b>에 오신 것을
          환영합니다! 😍
          <br />
          <b>당장 공부하지 않으면 당신의 인생이 망할 수도 있습니다!!</b>
        </p>
      </div>
      <hr />
      <div className="mypage-contents">
        {/* 내 학습 */}
        <div className="box my-edu">
          <h3>
            <Link to="/myedu">내 학습</Link>
            <Link to="/myedu">
              <span>more</span>
            </Link>
          </h3>
          <ul className="myedu-list">
            {memoizedUserEduList.length > 0 ? (
              memoizedUserEduList.map((edu) => {
                const userReview = reviewList.find(
                  (r) => r.uid === userInfo?.uid && r.eduId === edu.eduId
                );
                return (
                  <li key={edu.eduId}>
                    <picture onClick={() => navigate(`/detail/${edu.eduId}`)}>
                      <img
                        src={`./images/edu_thumb/${edu.eduId}.png`}
                        alt={`강의 이미지 ${edu.eduId}`}
                      />
                    </picture>
                    <h4>{edu.eduName}</h4>
                    <p>진도율: ({edu.eduRate}%)</p>
                    {parseInt(edu.eduRate) >= 60 && (
                      <button
                        className="my-review-btn"
                        onClick={() => openReviewPopup(edu.eduId)}
                      >
                        {userReview ? (
                          <span className="star-grade2">
                            평점 (
                            <img
                              src="./images/main/star.png"
                              alt="별"
                              width="8px"
                            />
                            <img
                              src="./images/main/star.png"
                              alt="별"
                              width="8px"
                            />{" "}
                            {userReview.grade})
                          </span>
                        ) : (
                          "수강평 작성"
                        )}
                      </button>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="empty-msg">학습중인 강의가 없습니다.</li>
            )}
          </ul>
        </div>

        {/* 커뮤니티 게시글 */}
        <div className="box my-community">
          <h3>
            <Link to="/board">내 커뮤니티 게시글</Link>
            <Link to="/board">
              <span>more</span>
            </Link>
          </h3>
          <ul className="myboard-list">
            {memoizedBoardList.length > 0 ? (
              memoizedBoardList.map((post) => (
                <li
                  key={post.idx}
                  onClick={() =>
                    navigate("/board", { state: { mode: "R", selData: post } })
                  }
                >
                  <h4>{post.tit}</h4>
                  <p>
                    {post.date} | 조회수: {post.cnt}
                  </p>
                </li>
              ))
            ) : (
              <li className="empty-msg">
                <p>작성한 게시글이 없습니다.</p>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 수강평 작성 팝업 */}
      {showPopup && selectedReview && (
        <div className="review-popup">
          <div className="popup-content">
            <ul>
              <h3>수강평 작성</h3>
              <li>
                <label>
                  <span>평점 </span>
                  <input
                    type="number"
                    name="grade"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={newReview.grade}
                    onChange={handleChange}
                  />
                </label>
              </li>
              <li>
                <label>
                  <span>내용 </span>
                  <textarea
                    name="text"
                    value={newReview.text}
                    onChange={handleChange}
                  />
                </label>
              </li>
            </ul>
            <div>
              <button onClick={saveReview}>저장</button>
              {reviewList.some(
                (r) =>
                  r.uid === selectedReview.uid &&
                  r.eduId === selectedReview.eduId
              ) && <button onClick={deleteReview}>삭제</button>}
              <button onClick={closePopup}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mypage;
