// 강의 상세페이지 컴포넌트 : ./src/components/pages/DetailView.jsx ////

import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import "../../scss/detail_view.scss";
// 강의 json 데이터 불러오기
import eduData from "../../js/data/edu_data.json";
// 리뷰 json 데이터 불러오기
import reviewData from "../../js/data/review_data.json";
// 로그인한 사용자의 학습 데이터 불러오기
import userData from "../../js/data/user_data.json";

const DetailView = () => {
  const {id} = useParams();
  const [edu, setEdu] = useState(null);
  const [reviews, setReviews] = useState([]); // 리뷰를 배열로 저장
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [userEduState, setUserEduState] = useState(null);
  const [userEduRate, setUserEduRate] = useState(null);

  useEffect(() => {
    // 세션 스토리지에서 로그인한 사용자 정보 가져오기
    const storedUser = sessionStorage.getItem("minfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);

      // 로그인한 사용자의 학습 데이터 확인
      const currentUserData = userData.find((user) => user.uid === parsedUser.uid);
      if (currentUserData) {
        const enrolledCourse = currentUserData.eduIng.find((course) => course.eduId === Number(id));
        if (enrolledCourse) {
          setUserEduState(enrolledCourse.eduState);
          setUserEduRate(enrolledCourse.eduRate);
        }
      }
    }
  }, [id]);

  // 강의 데이터 가져오기
  useEffect(() => {
    // eduData에서 id에 해당하는 강의 정보를 찾아서 edu 상태로 설정
    const selectedEdu = eduData.find((item) => item.idx === Number(id));
    setEdu(selectedEdu);
  }, [id]);

  // 리뷰 데이터 가져오기
  useEffect(() => {
    // 로컬스토리지에서 'review-data' 가져오기
    let storedReviews = JSON.parse(localStorage.getItem("review-data"));
  
    // 만약 로컬스토리지에 리뷰 데이터가 없으면 기본 JSON 데이터 사용
    if (!storedReviews) {
      storedReviews = reviewData;
    }
  
    // 해당 강의의 리뷰 필터링
    const filteredReviews = storedReviews.filter((item) => item.eduId === Number(id));
    setReviews(filteredReviews);
  }, [id]);

  if (!edu) return <p>강의 정보가 없습니다... ㅠㅠ</p>;

  const formatPrice = (price) => {
    const priceNum = Number(price);
    return priceNum === 0 ? "무료" : `₩${priceNum.toLocaleString()}`;
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
              {" "}
              ({" "}
              <span className="star-grade2">
                <img src="../images/main/star.png" alt="별" width="8" />
                <img src="../images/main/star.png" alt="별" width="8" />
              </span>
              4.7 {" "}) 수강평 986개 수강생 31,831명
            </span>
          </div>
          <div className="edu-thumb">
            <img src={`../images/edu_thumb/${edu.idx}.png`} alt={`교육 이미지 ${edu.idx}`} />
          </div>
        </div>
      </div>
      <div className="detail-content">
        <aside>
          <div className="detail-aside-wrap">
            <div className="sale-msg">{userInfo ? `${userInfo.unm}님` : "회원 가입하면"} 첫 구매 할인 중 (1일 남음)</div>
            <div className="inner">
              <p className="price">
                <b>{formatPrice(edu.gPrice)}</b>
              </p>
              {userEduState ? (
                <button className="edu-state-btn">
                  <Link to="/myedu">
                    {userEduState}(진행률:{userEduRate}%)
                  </Link>
                </button>
              ) : (
                <button className="add-edu-btn">
                  <Link to="/mypage">수강 신청하기</Link>
                </button>
              )}
              {/* <button className="add-cart-btn">바구니에 담기</button> */}
            </div>
            <div className="aside-info">
              <p>
                <em>지식공유자</em> 인프런{" "}
              </p>
              <p>
                <em>수업 수</em> 총 58개 (14시간 17분){" "}
              </p>
              <p>
                <em>수강기한</em> 무제한{" "}
              </p>
              <p>
                <em>수료증</em> 제공{" "}
              </p>
              <p>
                <em>난이도</em> {edu.gLevel}
              </p>
            </div>
            {/* <p>{edu.gSkill}</p> */}
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
                      수강평 평점 {review.grade}
                      {Array.from({length: Math.round(review.grade / 0.5)}, (_, i) => (
                        <span className="half-star">
                          <img key={i} src="../images/main/star.png" alt="별" width="8" />
                        </span>
                      ))}
                    </span>
                    <p>{review.text}</p>
                  </li>
                ))
              ) : (
                <p className="empty-msg">이 강의는 리뷰가 없습니다... ㅠㅠ</p>
              )}
            </ul>
          </div>
          <div className="box">
            <h3> 이런 걸 배울 수 있어요 </h3>
            <div className="box-list1">
              <ul className="mantine-Stack-root css-1rr4qq7 mantine-1kzvwqj">
                <li className="mantine-Group-root css-1n0sxg9 mantine-1yyyn9b">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-check" className="svg-inline--fa fa-circle-check css-z14cyq" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
                  </svg>
                  <p className="mantine-Text-root css-1c7euc4 mantine-5jqdej">입문자도 쉽게 할 수 있는 프로그래밍 입문</p>
                </li>
                <li className="mantine-Group-root css-1n0sxg9 mantine-1yyyn9b">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-check" className="svg-inline--fa fa-circle-check css-z14cyq" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
                  </svg>
                  <p className="mantine-Text-root css-1c7euc4 mantine-5jqdej">파이썬 기초 문법과 활용법을 배울 수 있어요</p>
                </li>
                <li className="mantine-Group-root css-1n0sxg9 mantine-1yyyn9b">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-check" className="svg-inline--fa fa-circle-check css-z14cyq" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
                  </svg>
                  <p className="mantine-Text-root css-1c7euc4 mantine-5jqdej">데이터 분석</p>
                </li>
                <li className="mantine-Group-root css-1n0sxg9 mantine-1yyyn9b">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-check" className="svg-inline--fa fa-circle-check css-z14cyq" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path>
                  </svg>
                  <p className="mantine-Text-root css-1c7euc4 mantine-5jqdej">업무 자동화</p>
                </li>
              </ul>
            </div>

            <div className="box-list2">
              <p className="tit">
                파이썬 입문,
                <br />
                누구나 할 수 있어요! 💪
              </p>
              <p>
                <img src="https://cdn.inflearn.com/public/files/courses/324145/cda9b423-a410-497a-ae22-8d36b100bf99/1.png" alt="" />
              </p>
              <p>
                <img src="https://cdn.inflearn.com/public/files/courses/324145/129d8e36-3974-4ebe-a5fa-e4bd82f8ac0f/speak.gif" alt="" />
              </p>
              <h3>프로그래밍이 우리에게 자유를 줄 수단이라서가 아닐까요?&nbsp;</h3>
              <ul>
                <li>과제를 위한 자료 찾기를 클릭 한 번으로!</li>
                <li>수많은 거래처에 보낼 문서를 엔터 한 번으로!</li>
                <li>매달 해야 하는 반복 업무를 컴퓨터가 자동으로!</li>
              </ul>
              <p>
                최근 코딩과 관련된 교육 과목이 증가하면서 프로그래밍과 관련된 교육/직무에 관한 관심도 많이 증가하고 있죠. 게다가 수많은 기업이나 팀에서 코딩을 필수 덕목으로 생각하기 시작했어요. <span>대기업 입사 면접에서 비전공자들에게 파이썬 할 줄 아냐고 물어보기도 하죠.</span>
              </p>
              <p>프로그래밍을 취미로 투잡하는 사람들, 여행 다니며 일하는 만들고 싶은 것을 만드는 노마드 인생을 즐기는 사람들도 늘어나고 있어요.</p>
            </div>

            <div className="box-list3">
              <h3>
                <strong>
                  하지만 코딩은 어쩐지
                  <br />
                  어렵게 느껴지지 않나요?
                </strong>
              </h3>
              <div className="card-wrapper">
                <div className="card-el">
                  <div>
                    <p>
                      <span>🥺</span>
                    </p>
                    <p>코딩 강의가 너무 비싼데, 강의 내용이 좋을지 모르겠어요. 한두 번 듣고 안 들을까 봐 걱정돼요.</p>
                  </div>
                </div>
                <div className="card-el">
                  <div>
                    <p>
                      <span>😗</span>
                    </p>
                    <p>
                      <span>혼자 코딩 공부 중인데, 제가 하는 게 맞는지 모르겠어요. 모르는 건 누구한테 질문해야 하나요?</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-wrapper card-wrapper-2">
                <div className="card-el">
                  <div>
                    <p>
                      <span>🤔</span>
                    </p>
                    <p>
                      <span>무작정 시작해도 되는 건가요? 어떤 걸 어떻게 공부해야 할지 모르겠어요.</span>
                    </p>
                  </div>
                </div>
                <div className="card-el">
                  <div>
                    <p>
                      <span>🤨</span>
                    </p>
                    <p>
                      <span>시간도 없고 학원도 너무 멀어서 코딩 공부를 시작하기가 쉽지 않아요.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="box-list4">
              <hr />
              <h3>
                <strong>고민은 그만!&nbsp;</strong>
                <br />
                <strong>누구나 재미있게 배울 수 있어요 💡</strong>
              </h3>
              <p>
                <a href="http://inf-mindmap.s3-website.ap-northeast-2.amazonaws.com/inflearn-python-courses-807b09e61479572aac84b4130be7a6a2.html" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn.inflearn.com/public/files/courses/324145/9b09b0a8-ea66-4743-8aba-fd5c1395fc84/optimize.jfif" alt="" />
                </a>
              </p>
              <h3>
                <strong>파이썬(Python)이란?</strong>
              </h3>
              <p>우리가 매일 만나는 웹 사이트, 앱을 만들 수 있는 프로그래밍 언어예요. 웹, 앱 말고도 게임, 인공지능 등 파이썬으로 할 수 있는 것들이 정말 많아요. 배우기가 다른 언어보다 쉽다는 점을 포함한 다양한 장점 덕분에 인기 언어로 꼽히고 있어요.</p>
              <p>
                <img src="https://cdn.inflearn.com/public/files/courses/330551/8e3b0004-4d06-4495-a4de-3e43d4d877da/7.png" alt="" title="7.png" />
              </p>
              <h3>
                <strong>왜 파이썬을 배워야 할까요?</strong>
              </h3>
              <p>
                파이썬은 문법 구조가 쉽기 때문에 프로그래밍을 처음 접하는 초보자도 쉽게 이해할 수 있어요. 파이썬은 그 어떤 프로그래밍 언어보다 <span>확장성이 월등히 높은 언어</span>예요. 데이터 분석가도, 웹 개발자도, 머신러닝 연구자도, 대학원생도 파이썬을 사용하죠. 당신이 어떤 업무를 맡더라도
                파이썬만 알아두면 척척 대응하기 쉬워집니다.
              </p>
              <p>당연히 비전공자도 다룰 수 있습니다. 프로그래밍 언어는 만국 공통어에요. 만약 C, Java 등의 언어를 접해봤다면 더욱 쉽게 파이썬을 익힐 수 있겠죠.</p>
            </div>
            <div className="box-list5">
              <h3>
                <strong>파이썬의 특장점 ⭐</strong>
              </h3>
              <div className="card-wrapper card-wrapper-3">
                <div className="card-el">
                  <div>
                    <p>
                      <img src="https://cdn.inflearn.com/public/files/courses/330551/e5542339-5a11-42ba-93b1-1f131c8c9119/blue-check.png" alt="" title="blue-check.png" width="35" height="35" />
                    </p>
                    <p>
                      <b>코딩 입문에 딱</b>
                    </p>
                    <p>
                      <span>파이썬은 사람의 언어와 닮아서 상대적으로 배우기 쉬운 개발 언어입니다.</span>
                    </p>
                  </div>
                </div>
                <div className="card-el">
                  <div>
                    <p>
                      <img src="https://cdn.inflearn.com/public/files/courses/330551/6ee5926e-0222-4bdd-95a2-107dab988b2d/blue-check.png" alt="" title="blue-check.png" width="35" height="35" />
                    </p>
                    <p>
                      <strong>
                        <b>거대한 커뮤니티</b>
                      </strong>
                    </p>
                    <p>커뮤니티에서 참고할 자료가 많고, 다른 사람들에게 도움받기도 쉬워요.&nbsp;</p>
                  </div>
                </div>
                <div className="card-el">
                  <div>
                    <p>
                      <img src="https://cdn.inflearn.com/public/files/courses/330551/ed0cf322-9ef6-4537-af3f-cc07b66e58f0/blue-check.png" alt="" title="blue-check.png" width="35" height="35" />
                    </p>
                    <p>
                      <span>
                        <b>높은 활용성</b>
                      </span>
                    </p>
                    <p>
                      <span>웹 개발, 데이터 분석, 해킹 등 다양한 분야에서 쓰이는 언어예요.</span>
                    </p>
                  </div>
                </div>
                <div className="card-el">
                  <div>
                    <p>
                      <img src="https://cdn.inflearn.com/public/files/courses/330551/387e460e-2479-4f29-ac2c-b559c3e9dd40/blue-check.png" alt="" title="blue-check.png" width="35" height="35" />
                    </p>
                    <p>
                      <span>
                        <b>많은 라이브러리</b>
                      </span>
                    </p>
                    <p>
                      <span>다양한 파이썬 라이브러리와 함께 빠른 결과물을 만들 수 있어요.</span>
                    </p>
                  </div>
                </div>
                <div className="card-el">
                  <div>
                    <p>
                      <img src="https://cdn.inflearn.com/public/files/courses/330551/9be395c8-0d98-4b2a-b48f-951213e11a67/blue-check.png" alt="" title="blue-check.png" width="35" height="35" />
                    </p>
                    <p>
                      <strong>
                        <b>업무 자동화</b>
                      </strong>
                    </p>
                    <p>
                      <span>메일 분류, 웹 크롤링 등 반복적이고 오래 걸리는 일을 빨리할 수 있어요.</span>
                    </p>
                  </div>
                </div>
                <div className="card-el">
                  <div>
                    <p>
                      <img src="https://cdn.inflearn.com/public/files/courses/330551/9f8c407b-7cb7-437b-81b3-c2d5327ce1ed/blue-check.png" alt="" title="blue-check.png" width="35" height="35" />
                    </p>
                    <p>
                      <span>
                        <b>많은 기업의 관심</b>
                      </span>
                    </p>
                    <p>
                      <span>인스타그램 등 유명 사이트도 파이썬으로 만들어진 경우가 많아요.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailView;
