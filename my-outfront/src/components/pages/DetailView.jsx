import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../modules/CartContext";
import "../../scss/detail_view.scss";

import eduData from "../../js/data/edu_data.json";
import reviewData from "../../js/data/review_data.json";

const DetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [edu, setEdu] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [userEduRate, setUserEduRate] = useState(null);

  const { addToCart, updateCart, isInCart } = useCart(); // ✅ CartContext 훅 사용

  useEffect(() => {
    const storedUser = sessionStorage.getItem("minfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);

      const storedData = localStorage.getItem("mypage-user-data");
      const userEduData = JSON.parse(storedData);
      const currentUserData = userEduData.find(
        (user) => user.uid === parsedUser.uid
      );

      if (currentUserData) {
        const enrolledCourse = currentUserData.eduIng.find(
          (course) => course.eduId === Number(id)
        );
        if (enrolledCourse) {
          setUserEduRate(enrolledCourse.eduRate);
        }
      }
    }
  }, [id]);

  useEffect(() => {
    const selectedEdu = eduData.find((item) => item.idx === Number(id));
    setEdu(selectedEdu);
  }, [id]);

  useEffect(() => {
    let storedReviews =
      JSON.parse(localStorage.getItem("review-data")) || reviewData;
    const filteredReviews = storedReviews.filter(
      (item) => item.eduId === Number(id)
    );
    setReviews(filteredReviews);
  }, [id]);

  const averageGrade = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce(
      (sum, review) => sum + Number(review.grade),
      0
    );
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  if (!edu) return <p>강의 정보가 없습니다... ㅠㅠ</p>;

  const formatPrice = (price) => {
    const priceNum = Number(price);
    return priceNum === 0 ? "무료" : `₩${priceNum.toLocaleString()}`;
  };

  const handleEnroll = () => {
    if (!userInfo) {
      alert("회원 로그인 후 수강신청 해주세요~!");
      return;
    }

    // 장바구니에 추가
    const isInCartAlready = isInCart(edu.idx);
    if (!isInCartAlready) {
      const newEdu = {
        idx: edu.idx,
        gName: edu.gName,
        gCate: edu.gCate,
        gPrice: edu.gPrice,
      };
      updateCart([...JSON.parse(localStorage.getItem("cart") || "[]"), newEdu]);
    }

    navigate("/cartlist");
  };

  return (
    <div className="detail-wrap">
      <div className="detail-header">
        <div className="inner">
          <div className="info-txt">
            <button onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left"></i>뒤로가기
            </button>
            <p>
              <b>{edu.gCate}</b>
            </p>
            <h2>{edu.gName}</h2>
            <p>{edu.gInfo}</p>
            <span>
              <span className="star-grade">
                {Array.from(
                  { length: Math.round(averageGrade / 0.5) },
                  (_, i) => (
                    <span className="half-star" key={i}>
                      <img src="../images/main/star.png" alt="별" width="8" />
                    </span>
                  )
                )}
                {reviews.length > 0 && (
                  <>
                    &nbsp;({averageGrade}) 수강평 {reviews.length}개
                  </>
                )}
              </span>{" "}
            </span>
          </div>
          <div className="edu-thumb">
            <img
              src={`../images/edu_thumb/${edu.idx}.png`}
              alt={`교육 이미지 ${edu.idx}`}
            />
              <button
                className="edu-btn"
                onClick={() => navigate(`/videodetail/${edu.idx}`)}
              >
                {
                  userEduRate !== null ? (
                    <>
                    강의 학습하기 (진도율: {userEduRate}%)
                    </>
                  ) : (
                    <>
                    강의 미리보기
                    </>
                  )
                }
              </button>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <aside>
          <div className="detail-aside-wrap">
            <div
              className={`sale-msg ${
                userEduRate !== null ? "displaynone" : ""
              }`}
            >
              {userInfo ? `${userInfo.unm}님` : "회원 가입하면"} 첫 구매 할인 중
              (1일 남음)
            </div>
            <div className="inner">
              <p className="price">
                <b>{formatPrice(edu.gPrice)}</b>
              </p>
              {userEduRate !== null ? (
                <button className="edu-state-btn">
                  <Link to="/myedu">내 학습 리스트 보러가기</Link>
                </button>
              ) : (
                <>
                  <button className="add-edu-btn" onClick={handleEnroll}>
                    수강 신청하기
                  </button>
                  <button
                    className="add-cart-btn"
                    onClick={(e) => addToCart(e, edu)}
                  >
                    바구니에 담기
                  </button>
                </>
              )}
            </div>
            <div className="aside-info">
              <p>
                <em>지식공유자</em> 인프런
              </p>
              <p>
                <em>수업 수</em> 총 58개 (14시간 17분)
              </p>
              <p>
                <em>수강기한</em> {edu.gDate}
              </p>
              <p>
                <em>수료증</em> 제공
              </p>
              <p>
                <em>난이도</em> {edu.gLevel}
              </p>
            </div>
          </div>
        </aside>

        <section>
          <div className="detail-review-wrap">
            <h3>
              <b>{edu.gLevel}자</b>를 위한 <b>[{edu.gCate}]</b> 강의입니다.
            </h3>
            <ul className="detail-review-list">
              {reviews.length > 0 ? (
                reviews.map((review, i) => (
                  <li key={i}>
                    <span className="star-grade">
                      <b>{review.name}님</b>
                      <em>수강평 평점 {review.grade}</em>
                      {Array.from(
                        { length: Math.round(review.grade / 0.5) },
                        (_, i) => (
                          <span className="half-star" key={i}>
                            <img
                              src="../images/main/star.png"
                              alt="별"
                              width="8"
                            />
                          </span>
                        )
                      )}
                    </span>
                    <p>{review.text}</p>
                  </li>
                ))
              ) : (
                <p className="empty-msg">이 강의는 리뷰가 없습니다...</p>
              )}
            </ul>
          </div>
          {/* 강의소개 영역 */}
          <div className="detail-info-wrap">
            <p>작성된 강의 소개글이 없습니다...</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailView;
