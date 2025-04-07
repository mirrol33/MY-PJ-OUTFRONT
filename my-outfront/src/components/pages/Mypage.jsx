import React, { useEffect, useState } from "react";
import "../../scss/mypage.scss";
import { Link, useNavigate } from "react-router-dom";
import userData from "../../js/data/user_data.json";
import reviewData from "../../js/data/review_data.json";

// 프로필 이미지 컴포넌트
const ProfileImage = ({ profileImg, onChange }) => (
  <div>
    <label htmlFor="profile-upload">
      <picture>
        <img src={profileImg} alt="profile" />
        <span><i className="fa-solid fa-image"></i></span>
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
  const [userEduList, setUserEduList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newReview, setNewReview] = useState({ grade: 0.5, text: "수강 후기를 작성해주세요" });
  const [userBoardPosts, setUserBoardPosts] = useState([]);
  const [profileImg, setProfileImg] = useState(localStorage.getItem("profile-img") || "./images/mypage/1.png");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // 1. 필요한 데이터 가져오기
    const minfo = JSON.parse(sessionStorage.getItem("minfo")); // 로그인 정보
    const storedCart = JSON.parse(localStorage.getItem("cart")) || []; // 장바구니
    let storedUserData = JSON.parse(localStorage.getItem("mypage-user-data")); // 유저 학습 정보
    const storedReviews = JSON.parse(localStorage.getItem("review-data")) || reviewData; // 수강평
    const storedBoard = JSON.parse(localStorage.getItem("board-data")) || []; // 커뮤니티 게시글

    // 2. 사용자 정보가 없으면 초기 세팅
    if (!storedUserData) {
      localStorage.setItem("mypage-user-data", JSON.stringify(userData));
      storedUserData = userData;
    }

    setReviewList(storedReviews);

    // 3. 로그인한 경우 처리
    if (minfo) {
      setUserInfo(minfo);

      // 로그인한 사용자 정보 추출
      const currentUser = storedUserData.find(user => user.uid === minfo.uid);
      const eduIng = currentUser?.eduIng || [];

      // 학습중인 강의 ID 목록 추출
      const learningIds = eduIng.map((edu) => edu.eduId);

      // 장바구니에서 학습중인 강의 제거
      const removedItems = storedCart.filter(item => learningIds.includes(item.idx)); // 제거될 항목
      const filteredCart = storedCart.filter(item => !learningIds.includes(item.idx)); // 남길 항목

      setCart(filteredCart);
      localStorage.setItem("cart", JSON.stringify(filteredCart));
      window.dispatchEvent(new Event("cartUpdated"));

      // 제거된 항목이 있으면 알림
      if (removedItems.length > 0) {
        const removedNames = removedItems.map(item => `"${item.idx}"`).join(", ");
        alert(`이미 학습 중인 강의는 장바구니에서 제거되었습니다: ${removedNames}`);
      }

      setUserEduList(eduIng);
      setUserBoardPosts(storedBoard.filter(post => post.uid === minfo.uid));
    } else {
      // 비로그인: 장바구니 그대로 유지
      setCart(storedCart);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }, []);

  const openReviewPopup = (eduId) => {
    const userReview = reviewList.find(review => review.uid === userInfo.uid && review.eduId === eduId);
    setSelectedReview({ eduId, uid: userInfo.uid });
    setNewReview(userReview ? { grade: userReview.grade, text: userReview.text } : { grade: 0.5, text: "수강 후기를 작성해주세요" });
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedReview(null);
    setNewReview({ grade: 0.5, text: "수강 후기를 작성해주세요" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: name === "grade" ? parseFloat(value) : value }));
  };

  const saveReview = () => {
    const updatedReview = {
      ...newReview,
      uid: userInfo.uid,
      name: userInfo.unm,
      eduId: selectedReview.eduId,
    };

    const updatedList = [...reviewList];
    const existingIndex = updatedList.findIndex(review => review.uid === userInfo.uid && review.eduId === selectedReview.eduId);

    if (existingIndex !== -1) {
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...updatedReview };
    } else {
      const newIdx = updatedList.length > 0 ? updatedList[updatedList.length - 1].idx + 1 : 1;
      updatedList.push({ ...updatedReview, idx: newIdx });
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
      localStorage.setItem("profile-img", img);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mypage-wrap">
      <div className="mypage-top">
        <h2>{userInfo ? `${userInfo.unm}님의 마이페이지` : "마이페이지"}</h2>
        <ProfileImage profileImg={profileImg} onChange={handleProfileChange} />
        <span>ID : {userInfo?.uid || "로그인 필요!"}</span>
        <p>
          <b>{userInfo?.unm || "비회원"}</b>님 😎 <b>아웃프런</b>에 오신 것을 환영합니다! 😍<br />
          <b>당장 공부하지 않으면 당신의 인생이 망할 수도 있습니다!!</b>
        </p>
      </div>
      <hr />
      <div className="mypage-contents">
        {/* 내 학습 */}
        <div className="box my-edu">
          <h3>
            <Link to="/myedu">내 학습</Link>
            <Link to="/myedu"><span>more</span></Link>
          </h3>
          <ul className="myedu-list">
            {userEduList.length > 0 ? (
              userEduList.map((edu) => {
                const userReview = reviewList.find(r => r.uid === userInfo.uid && r.eduId === edu.eduId);
                return (
                  <li key={edu.eduId}>
                    <picture onClick={() => navigate(`/detail/${edu.eduId}`)}>
                      <img src={`./images/edu_thumb/${edu.eduId}.png`} alt={`강의 이미지 ${edu.eduId}`} />
                    </picture>
                    <h4>{edu.eduName}</h4>
                    <p>{edu.eduState} ({edu.eduRate}%)</p>
                    {parseInt(edu.eduRate) >= 60 && (
                      <button className="my-review-btn" onClick={() => openReviewPopup(edu.eduId)}>
                        {userReview ? (
                          <span className="star-grade2">
                            평점 (<img src="./images/main/star.png" alt="별" width="8px" />
                            <img src="./images/main/star.png" alt="별" width="8px" /> {userReview.grade})
                          </span>
                        ) : "수강평 작성"}
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
            <Link to="/myedu">내 커뮤니티 게시글</Link>
            <Link to="/myedu"><span>more</span></Link>
          </h3>
          <ul className="myboard-list">
            {userBoardPosts.length > 0 ? (
              userBoardPosts.map((post) => (
                <li key={post.idx} onClick={() => navigate("/board", { state: { mode: "R", selData: post } })}>
                  <h4>{post.tit}</h4>
                  <p>{post.date} | 조회수: {post.cnt}</p>
                </li>
              ))
            ) : (
              <li className="empty-msg"><p>작성한 게시글이 없습니다.</p></li>
            )}
          </ul>
        </div>
      </div>

      {/* 수강평 팝업 */}
      {showPopup && selectedReview && (
        <div className="review-popup">
          <div className="popup-content">
            <ul>
              <h3>수강평 작성</h3>
              <li>
                <label>
                  <span>평점 </span>
                  <input type="number" name="grade" min="0.5" max="5" step="0.5" value={newReview.grade} onChange={handleChange} />
                </label>
              </li>
              <li>
                <label>
                  <span>내용 </span>
                  <textarea name="text" value={newReview.text} onChange={handleChange} />
                </label>
              </li>
            </ul>
            <div>
              <button onClick={saveReview}>저장</button>
              <button onClick={closePopup}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mypage;
