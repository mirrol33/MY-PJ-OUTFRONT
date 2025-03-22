// Mypage.jsx
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

// 마이페이지 컴포넌트
const Mypage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null); // 로그인한 사용자 정보
  const [userEduList, setUserEduList] = useState([]); // 사용자 내학습 리스트 정보
  const [reviewList, setReviewList] = useState(reviewData); // 수강평 정보
  const [selectedReview, setSelectedReview] = useState(null); // 수강평 정보
  const [showPopup, setShowPopup] = useState(false); // 수강평 팝업
  const [newReview, setNewReview] = useState({
    idx: null,
    eduId: "",
    uid: "",
    name: "",
    grade: 0.5, // 평점 기본값 0.5
    text: "수강 후기를 작성해주세요", // 리뷰 기본값
  }); // 신규 수강평
  const [userBoardPosts, setUserBoardPosts] = useState([]); // 사용자 커뮤니티 게시글 정보
  const [profileImg, setProfileImg] = useState("./images/mypage/1.png"); // 사용자 프로필 이미지

  useEffect(() => {
    // 로컬스토리지에서 'mypage-user-data' 키가 있는지 확인
    let storedUserData = localStorage.getItem("mypage-user-data");

    if (!storedUserData) {
      // 로컬스토리지에 'mypage-user-data'가 없으면 user_data.json 데이터를 저장
      console.log(
        "로컬스토리지에 'mypage-user-data'가 없으므로, user_data.json을 추가합니다."
      );
      localStorage.setItem("mypage-user-data", JSON.stringify(userData));
      storedUserData = JSON.stringify(userData); // 로컬스토리지에 저장된 값을 다시 가져옴
    }

    const storedUser = sessionStorage.getItem("minfo"); // 로그인한 사용자 정보 읽기
    const storedReviews =
      JSON.parse(localStorage.getItem("review-data")) || reviewData; // 수강평 데이터 읽기
    setReviewList(storedReviews);

    if (storedUser) {
      // 만약 로그인한 사용자가 있다면
      const parsedUser = JSON.parse(storedUser); // 사용자 정보 객체화
      setUserInfo(parsedUser);

      storedUserData = JSON.parse(storedUserData); // 로컬스토리지에서 사용자 데이터 가져오기
      const currentUser = storedUserData.find(
        (user) => user.uid === parsedUser.uid
      ); // 로그인한 사용자가 내학습 데이터가 존재하는지 여부확인 (true/false)

      if (currentUser) {
        // true
        setUserEduList(currentUser.eduIng); // 내학습 데이터 셋팅!
      }

      const boardData = JSON.parse(localStorage.getItem("board-data")) || []; // 커뮤니티 게시글 읽기와 객체화
      setUserBoardPosts(
        boardData.filter((post) => post.uid === parsedUser.uid)
      ); // 커뮤니티 게시글 uid값과 로그인한 사용자 uid 값이 동일한 내 게시글만 셋팅!!
    }
  }, []);

  const openReviewPopup = (eduId) => {
    // 수강평 팝업 함수
    const userReview = reviewList.find(
      (review) => review.uid === userInfo.uid && review.eduId === eduId
    );

    if (userReview) {
      setSelectedReview(userReview);
      setNewReview({ grade: userReview.grade, text: userReview.text });
    } else {
      setSelectedReview({ eduId, uid: userInfo.uid });
      setNewReview({ grade: 0.5, text: "수강 후기를 작성해주세요" }); // 기본값 설정
    }

    setShowPopup(true);
  };

  const closePopup = () => {
    // 수강평 팝업 닫기 함수
    setShowPopup(false);
    setSelectedReview(null);
    setNewReview({ grade: 0.5, text: "수강 후기를 작성해주세요" }); // 기본값으로 초기화
  };

  const handleChange = (e) => {
    // 수강평 수정 함수
    const { name, value } = e.target;
    setNewReview((prevReview) => ({
      ...prevReview,
      [name]: name === "grade" ? parseFloat(value) : value,
    }));
  };

  const saveReview = () => {
    // 수강평 저장 함수
    const storedReviews =
      JSON.parse(localStorage.getItem("review-data")) || reviewData;

    // `uid`, `name`, `eduId`를 `userInfo`와 `newReview`에서 가져오기
    const updatedReview = {
      ...newReview,
      uid: userInfo.uid,
      name: userInfo.unm,
      eduId: selectedReview.eduId, // `eduId`를 추가
    };

    const existingReviewIndex = storedReviews.findIndex(
      (review) =>
        review.uid === userInfo.uid && review.eduId === selectedReview.eduId
    );

    if (existingReviewIndex !== -1) {
      // 기존 리뷰가 있으면 수정
      storedReviews[existingReviewIndex] = {
        ...storedReviews[existingReviewIndex],
        ...updatedReview,
      };
    } else {
      // 새로운 리뷰 추가
      const newIdx =
        storedReviews.length > 0
          ? storedReviews[storedReviews.length - 1].idx + 1
          : 1;
      storedReviews.push({ ...updatedReview, idx: newIdx });
    }

    localStorage.setItem("review-data", JSON.stringify(storedReviews));
    setReviewList(storedReviews);

    alert("수강평이 저장되었습니다!");
    setShowPopup(false);
  };

  const handleProfileChange = (event) => {
    const file = event.target.files[0];
    const fileExtension = file?.name.split(".").pop().toLowerCase();

    if (!["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      alert("이미지 파일(jpg, jpeg, png, gif)만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("이미지 크기가 2MB를 초과했습니다. 다른 이미지를 선택해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setProfileImg(imageUrl);
      localStorage.setItem("profile-img", imageUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mypage-wrap">
      <div className="mypage-top">
        <h2>{userInfo ? `${userInfo.unm}님의 마이페이지` : "마이페이지"}</h2>
        <ProfileImage profileImg={profileImg} onChange={handleProfileChange} />
        <span>ID : {userInfo ? userInfo.uid : "로그인 필요!"}</span>
        <p>
          <b>{userInfo ? userInfo.unm : "비회원"}</b>님 😎 <b>아웃프런</b>에
          오신 것을 환영합니다! 😍 <br />
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
            {userEduList.length > 0 ? (
              userEduList.map((edu) => {
                const userReview = reviewList.find(
                  (review) =>
                    review.uid === userInfo.uid && review.eduId === edu.eduId
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
                    <p>
                      {edu.eduState} ({edu.eduRate}%)
                    </p>
                    {parseInt(edu.eduRate) >= 60 && (
                      <button
                        className="my-review-btn"
                        onClick={() => openReviewPopup(edu.eduId)}>
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

        {/* 내 커뮤니티 게시글 */}
        <div className="box my-community">
          <h3>
            <Link to="/myedu">내 커뮤니티 게시글</Link>
            <Link to="/myedu">
              <span>more</span>
            </Link>
          </h3>
          <ul className="myboard-list">
            {userBoardPosts.length > 0 ? (
              userBoardPosts.map((post) => (
                <li
                  key={post.idx}
                  onClick={() =>
                    navigate("/board", { state: { mode: "R", selData: post } })
                  }>
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

      {/* 리뷰 팝업 */}
      {showPopup && selectedReview && (
        <div className="review-popup">
          <div className="popup-content">
            <h3>수강평 작성</h3>
            <label>
              평점:
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
            <label>
              내용:
              <textarea
                name="text"
                value={newReview.text}
                onChange={handleChange}
              />
            </label>
            <button onClick={saveReview}>저장</button>
            <button onClick={closePopup}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mypage;
