// MyEdu.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../scss/myedu.scss";
import reviewData from "../../js/data/review_data.json";
import userData from "../../js/data/user_data.json";

function MyEdu() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [userEduList, setUserEduList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [newReview, setNewReview] = useState({
    idx: null,
    eduId: "",
    uid: "",
    name: "",
    grade: 0.5,
    text: "수강 후기를 작성해주세요",
  });
  const [showPopup, setShowPopup] = useState(false);

  // 초기 로딩: 유저, 강의, 리뷰 세팅
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("minfo"));
    const storedUserData =
      JSON.parse(localStorage.getItem("mypage-user-data")) || userData;
    const storedReviews =
      JSON.parse(localStorage.getItem("review-data")) || reviewData;

    // userData가 없으면 저장
    if (!localStorage.getItem("mypage-user-data")) {
      console.log("user_data.json을 로컬스토리지에 저장합니다.");
      localStorage.setItem("mypage-user-data", JSON.stringify(userData));
    }

    if (storedUser) {
      setUserInfo(storedUser);
      const currentUser = storedUserData.find((u) => u.uid === storedUser.uid);
      setUserEduList(currentUser?.eduIng || []);
    }

    setReviewList(storedReviews);
  }, []);

  // 사용자 리뷰 조회 (메모이제이션)
  const getUserReview = useCallback(
    (eduId) =>
      reviewList.find(
        (review) => review.uid === userInfo?.uid && review.eduId === eduId
      ),
    [reviewList, userInfo]
  );

  // 수강평 팝업 열기
  const openReviewPopup = (eduId) => {
    const userReview = getUserReview(eduId);

    if (userReview) {
      setSelectedReview(userReview);
      setNewReview({
        grade: userReview.grade,
        text: userReview.text,
      });
    } else {
      setSelectedReview({ eduId, uid: userInfo.uid });
      setNewReview({
        grade: 0.5,
        text: "수강 후기를 작성해주세요",
      });
    }
    setShowPopup(true);
  };

  // 수강평 저장
  const saveReview = () => {
    const updatedReviews = [...reviewList];
    const existingIndex = updatedReviews.findIndex(
      (r) => r.uid === userInfo.uid && r.eduId === selectedReview.eduId
    );

    if (existingIndex !== -1) {
      updatedReviews[existingIndex] = {
        ...updatedReviews[existingIndex],
        grade: newReview.grade,
        text: newReview.text,
      };
    } else {
      const newIdx =
        updatedReviews.length > 0
          ? updatedReviews[updatedReviews.length - 1].idx + 1
          : 1;
      updatedReviews.push({
        idx: newIdx,
        eduId: selectedReview.eduId,
        uid: userInfo.uid,
        name: userInfo.unm,
        grade: newReview.grade,
        text: newReview.text,
      });
    }

    localStorage.setItem("review-data", JSON.stringify(updatedReviews));
    setReviewList(updatedReviews);
    alert("수강평이 저장되었습니다!");
    setShowPopup(false);
  };

  // 입력값 핸들링
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "grade") {
      value = parseFloat(value);
      if (value < 0.5 || value > 5 || value % 0.5 !== 0) {
        alert("평점은 0.5 단위로 입력해야 합니다. (0.5 ~ 5)");
        return;
      }
    }

    setNewReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasEduList = useMemo(() => userEduList.length > 0, [userEduList]);

  // 수강평 삭제
  const deleteReview = () => {
    const confirmed = window.confirm("정말로 이 수강평을 삭제하시겠습니까?");
    if (!confirmed) return;

    const updatedReviews = reviewList.filter(
      (r) => !(r.uid === userInfo.uid && r.eduId === selectedReview.eduId)
    );

    localStorage.setItem("review-data", JSON.stringify(updatedReviews));
    setReviewList(updatedReviews);
    alert("수강평이 삭제되었습니다.");
    setShowPopup(false);
  };

  return (
    <div className="my-edu-wrap">
      <h2>내 학습</h2>
      <ul className="myedu-list">
        {hasEduList ? (
          userEduList.map((edu) => {
            const review = getUserReview(edu.eduId);
            const isComplete = parseInt(edu.eduRate) >= 60;

            return (
              <li key={edu.eduId}>
                <picture onClick={() => navigate(`/videodetail/${edu.eduId}`)}>
                  <img
                    src={`./images/edu_thumb/${edu.eduId}.png`}
                    alt={`강의 이미지 ${edu.eduId}`}
                  />
                </picture>
                <h4>{edu.eduName}</h4>
                <p>진도율: ({edu.eduRate}%)</p>
                {isComplete && (
                  <button
                    className="my-review-btn"
                    onClick={() => openReviewPopup(edu.eduId)}
                  >
                    {review ? (
                      <span className="star-grade2">
                        평점 (
                        <img
                          src="./images/main/star.png"
                          alt="별"
                          width="8px"
                        />
                        <img src="./images/main/star.png" alt="별" width="8" />
                        {review.grade})
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
          <li className="empty-msg">현재 학습중인 강의가 없습니다.</li>
        )}
      </ul>
      {/* 수강평 작성 팝업 */}
      {showPopup && selectedReview && (
        <div className="review-popup">
          <div className="popup-content">
            <ul>
              <h3>수강평 작성</h3>
              <li>
                <label>
                  <span>평점</span>
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
                  <span>내용</span>
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
              {selectedReview && getUserReview(selectedReview.eduId) && (
                <button onClick={deleteReview} className="delete-btn">
                  삭제
                </button>
              )}
              <button onClick={() => setShowPopup(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEdu;
