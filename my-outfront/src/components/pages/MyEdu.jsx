import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../scss/myedu.scss"; // 스타일 파일을 가져옵니다.
import reviewData from "../../js/data/review_data.json"; // 리뷰 데이터 가져오기
import userData from "../../js/data/user_data.json"; // 사용자 데이터 가져오기

function MyEdu() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null); // 로그인한 사용자 정보
  const [userEduList, setUserEduList] = useState([]); // 사용자의 학습 목록
  const [reviewList, setReviewList] = useState(reviewData); // 리뷰 목록
  const [selectedReview, setSelectedReview] = useState(null); // 선택된 리뷰 정보
  const [newReview, setNewReview] = useState({
      idx: null,
      eduId: "",
      uid: "",
      name: "",
      grade: 0.5, // 평점 기본값 0.5
      text: "수강 후기를 작성해주세요", // 리뷰 기본값
    }); // 신규 수강평
  const [showPopup, setShowPopup] = useState(false); // 리뷰 팝업 표시 여부

  useEffect(() => {
    // 로컬스토리지에서 'mypage-user-data'가 존재하는지 체크
    let storedUserData = localStorage.getItem("mypage-user-data");

    if (!storedUserData) {
      // 로컬스토리지에 'mypage-user-data'가 없으면 user_data.json을 저장
      console.log("로컬스토리지에 'mypage-user-data'가 없으므로, user_data.json을 추가합니다.");
      localStorage.setItem("mypage-user-data", JSON.stringify(userData));
      storedUserData = JSON.stringify(userData); // 로컬스토리지에 저장된 값을 다시 가져옴
    }

    // 🔹 로컬스토리지에서 리뷰 데이터를 가져와 상태 설정
    const storedReviews = JSON.parse(localStorage.getItem("review-data")) || reviewData;
    setReviewList(storedReviews);
  
    // 세션 스토리지에서 로그인한 사용자 정보 가져오기
    const storedUser = sessionStorage.getItem("minfo");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);

      // 로그인한 사용자와 uid가 같은 데이터를 찾기
      storedUserData = JSON.parse(storedUserData); // user_data.json 데이터를 파싱
      const currentUser = storedUserData.find(
        (user) => user.uid === parsedUser.uid
      );
      if (currentUser) {
        setUserEduList(currentUser.eduIng); // 학습 목록 설정
      }
    }
  }, []);

  useEffect(() => {
    if (userInfo) {
      // userInfo가 업데이트되었을 때, userData를 로컬스토리지에서 찾아서 업데이트
      let storedUserData = JSON.parse(localStorage.getItem("mypage-user-data")) || [];
      const currentUser = storedUserData.find((user) => user.uid === userInfo.uid);
      if (currentUser) {
        setUserEduList(currentUser.eduIng); // 학습 목록 설정
      }
    }
  }, [userInfo]); // userInfo가 업데이트될 때마다 실행

  // 수강평 팝업 열기
  const openReviewPopup = (eduId) => {
    const userReview = reviewList.find(
      (review) => review.uid === userInfo.uid && review.eduId === eduId
    );

    if (userReview) {
      setSelectedReview(userReview);
      setNewReview({ grade: userReview.grade, text: userReview.text });
    } else {
      setSelectedReview({ eduId, uid: userInfo.uid });
      setNewReview({ grade: 0.5, text: "수강 후기를 작성해주세요" }); // 기본값으로 초기화
    }
    setShowPopup(true);
  };

  // 수강평 저장
  const saveReview = () => {
    let storedReviews = JSON.parse(localStorage.getItem("review-data")) || reviewData;

    const existingReviewIndex = storedReviews.findIndex(
      (review) => review.uid === userInfo.uid && review.eduId === selectedReview.eduId
    );

    if (existingReviewIndex !== -1) {
      storedReviews[existingReviewIndex] = {
        ...storedReviews[existingReviewIndex],
        grade: newReview.grade,
        text: newReview.text,
      };
    } else {
      const newIdx = storedReviews.length > 0 ? storedReviews[storedReviews.length - 1].idx + 1 : 1;
      const newReviewData = {
        idx: newIdx,
        eduId: selectedReview.eduId,
        uid: userInfo.uid,
        name: userInfo.unm,
        grade: newReview.grade,
        text: newReview.text,
      };
      storedReviews.push(newReviewData);
    }

    // 로컬 스토리지 업데이트
    localStorage.setItem("review-data", JSON.stringify(storedReviews));

    // 상태 업데이트하여 화면 갱신
    setReviewList(storedReviews);
    alert("수강평이 저장되었습니다!");
    setShowPopup(false);
  };

  // 입력 값 변경 핸들러
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "grade") {
      value = parseFloat(value);
      if (value < 0.5 || value > 5 || value % 0.5 !== 0) {
        alert("평점은 0.5 단위로 입력해야 합니다. (0.5 ~ 5)");
        return;
      }
    }

    setNewReview({ ...newReview, [name]: value });
  };

  return (
    <div className="my-edu-wrap">
      <h3>내 학습</h3>
      <ul className="myedu-list">
        {userEduList.length > 0 ? (
          userEduList.map((edu) => {
            const userReview = reviewList.find(
              (review) => review.uid === userInfo.uid && review.eduId === edu.eduId
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
                <p>{edu.eduState} ({edu.eduRate}%)</p>
                {parseInt(edu.eduRate) >= 60 && (
                  <button className="my-review-btn" onClick={() => openReviewPopup(edu.eduId)}>
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
                          width="8"
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
            <button onClick={() => setShowPopup(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEdu;
