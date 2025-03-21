// 마이페이지 컴포넌트 ./src/componets/page/Mypage.jsx
import React, {useEffect, useState} from "react";
import "../../scss/mypage.scss";
import {useNavigate} from "react-router-dom";
// 로그인한 사용자의 학습 정보 import 직접 불러오기
import userData from "../../js/data/user_data.json";
// 리뷰 데이터 import 직접 불러오기
import reviewData from "../../js/data/review_data.json";

function Mypage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null); // 로그인한 사용자 정보
  const [userEduList, setUserEduList] = useState([]); // 로그인한 사용자의 학습 목록
  const [reviewList, setReviewList] = useState(reviewData); // 리뷰 데이터
  const [selectedReview, setSelectedReview] = useState(null); // 선택된 리뷰 정보 (팝업)
  const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부
  const [userBoardPosts, setUserBoardPosts] = useState([]); // 사용자의 게시글 목록

  useEffect(() => {
    // 세션 스토리지에서 로그인한 사용자 정보 가져오기
    const storedUser = sessionStorage.getItem("minfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);

      // 로그인한 사용자의 학습 정보 가져오기
      const currentUser = userData.find((user) => user.uid === parsedUser.uid);
      if (currentUser) {
        setUserEduList(currentUser.eduIng);
      }
      // 게시판 데이터 불러오기
      const boardData = JSON.parse(localStorage.getItem("board-data")) || [];
      const myPosts = boardData.filter((post) => post.uid === parsedUser.uid);
      setUserBoardPosts(myPosts);
    }
  }, []);

  // 리뷰 팝업 열기 함수
  const openReviewPopup = (eduId) => {
    const userReview = reviewList.find((review) => review.uid === userInfo.uid && review.eduId === eduId);

    if (userReview) {
      setSelectedReview(userReview);
      setShowPopup(true);
    } else {
      alert("작성된 수강평이 없습니다.");
    }
  };

  // 팝업 닫기 함수
  const closePopup = () => {
    setShowPopup(false);
    setSelectedReview(null);
  };

  const [profileImg, setProfileImg] = useState("./images/mypage/1.png"); // 기본 프로필 이미지
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB 제한
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif"]; // 허용 확장자

  useEffect(() => {
    const storedUser = sessionStorage.getItem("minfo");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }

    // 저장된 프로필 이미지 가져오기
    const savedProfile = localStorage.getItem("profile-img");
    if (savedProfile) {
      setProfileImg(savedProfile);
    }
  }, []);

  // 프로필 이미지 변경 핸들러
  const handleProfileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // 확장자 확인
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        alert("이미지 파일(jpg, jpeg, png, gif)만 업로드할 수 있습니다.");
        return;
      }

      // 파일 크기 확인
      if (file.size > MAX_FILE_SIZE) {
        alert("이미지 크기가 2MB를 초과했습니다. 다른 이미지를 선택해주세요.");
        return;
      }

      // 파일이 유효하면 로컬 스토리지에 저장
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setProfileImg(imageUrl);
        localStorage.setItem("profile-img", imageUrl); // 변경된 프로필 저장
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mypage-wrap">
      <div className="mypage-top">
        <h2>{userInfo ? `${userInfo.unm}님의 마이페이지` : "마이페이지"}</h2>
        <label htmlFor="profile-upload">
          <picture>
            <img src={profileImg} alt="profile" />
          </picture>
        </label>
        <input type="file" id="profile-upload" accept="image/*" style={{display: "none"}} onChange={handleProfileChange} />
        <span>ID : {userInfo ? userInfo.uid : "로그인 필요!"}</span>
        <p>
          <b>{userInfo ? userInfo.unm : "비회원"}</b>님 😎 <b>아웃프런</b>에 오신 것을 환영합니다! 😍 <br />
          <b>당장 공부하지 않으면 당신의 인생이 망할 수도 있습니다!!</b>
        </p>
      </div>
      <hr />
      <div className="mypage-contents">
        {/* 내 학습 */}
        <div className="box my-edu">
          <h3>
            <a href="/myedu">내 학습</a>
            <a href="/myedu">
              <span>more</span>
            </a>
          </h3>
          <ul className="myedu-list">
            {userEduList.length > 0 ? (
              userEduList.map((edu) => {
                const userReview = reviewList.find((review) => review.uid === userInfo.uid && review.eduId === edu.eduId);

                return (
                  <li key={edu.eduId}>
                    <picture onClick={() => navigate(`/detail/${edu.eduId}`)}>
                      <img src={`./images/edu_thumb/${edu.eduId}.png`} alt={`강의 이미지 ${edu.eduId}`} />
                    </picture>
                    <h4>{edu.eduName}</h4>
                    <p>
                      {edu.eduState} ({edu.eduRate}%)
                    </p>
                    {parseInt(edu.eduRate) >= 60 && (
                      <button className="my-review-btn" onClick={() => openReviewPopup(edu.eduId)}>
                        {userReview ? (
                          <span className="star-grade2">
                            평점 (<img src="./images/main/star.png" alt="별" width="8px" /><img src="./images/main/star.png" alt="별" width="8" /> {userReview.grade})
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
            <a href="/board">내 커뮤니티 게시글</a>
            <a href="/board">
              <span>more</span>
            </a>
          </h3>
          <ul className="myboard-list">
            {userBoardPosts.length > 0 ? (
              userBoardPosts.map((post) => (
                <li key={post.idx} onClick={() => navigate("/board", {state: {mode: "R", selData: post}})}>
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
            <h3>수강평</h3>
            <p className="star-grade">
              <b>평점:</b>
              {Array.from({length: Math.round(selectedReview.grade / 0.5)}, (_, i) => (
                <span className="half-star">
                  <img key={i} src="./images/main/star.png" alt="별" width="8" />
                </span>
              ))}
            </p>
            <p>{selectedReview.text}</p>
            <button className="close-btn" onClick={closePopup}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mypage;
