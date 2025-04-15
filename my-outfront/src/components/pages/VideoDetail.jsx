/* 
요구사항 : 
1. 로컬스토리지에 minfo 데이터가 존재한다면, 로그인한 유저 정보이다. 
2. minfo의 uid 속성값과 mypage-user-data의 uid 속성값이 동일한 값을 찾는다.
3. 찾은 해당 mypage-user-data의 uid의 eduIng 속성값에서 eduId 값과 useParams의 id 값이 동일한 객체를 찾는다.
4. 찾은 객체의 watchedVideos 속성값에 vId를 push한다.
*/

// 강의 학습 상세페이지 : VideoDetail.jsx
import React, { useEffect, useMemo, useState, useRef, use } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoData from "../../js/data/video_data.json";
import userData from "../../js/data/user_data.json";
import "../../scss/pages/video_detail.scss";

/* 
// userData : user_data.json 또는,
// 로컬스토리지 데이터 : mypage-user-data
[
  {
    "idx": 1,
    "uid": "min",
    "unm": "이민경",
    "umail": "min1004@outfront.co.kr",
    "eduIng": [
      {
        "eduId": 1,
        "eduName": "김영한의 자바 입문 - 코드로 시작하는 자바 첫걸음",
        "eduRate": 60,
        "eduState": "학습중",
        "watchedVideos" : []
      },
      {
        "eduId": 2,
        "eduName": "프로그래밍 시작하기 : 파이썬 입문 (Inflearn Original)",
        "eduRate": 100,
        "eduState": "완강",
        "watchedVideos" : []
      },
      {
        "eduId": 3,
        "eduName": "[개발부터 수익화까지] AI로 코드 한 줄 짜지 않고 만드는 IT 올인원 실전 프로젝트!",
        "eduRate": 0,
        "eduState": "학습전",
        "watchedVideos" : []
      },
      {
        "eduId": 4,
        "eduName": "핵심만 쏙쏙 Jira&Confluence",
        "eduRate": 0,
        "eduState": "학습중",
        "watchedVideos" : []
      }
    ]
  },
  // 이하 생략...
*/
/* 
// 로컬스토리지 데이터 : minfo
{
  "idx": 3,
  "uid": "min",
  "pwd": "1111",
  "unm": "이민경",
  "eml": "min@example.com"
} 

*/

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storageKey = `watchedVideos_${id}`;

  const video = useMemo(
    () => videoData.find((v) => v.eduId === Number(id)),
    [id]
  );

  // 모든 section 추출
  const sections = useMemo(() => {
    if (!video) return [];
    return Object.entries(video)
      .filter(([key, val]) => key.startsWith("section") && Array.isArray(val))
      .map(([key, val]) => ({ name: key, videos: val }));
  }, [video]);

  const allVideos = useMemo(
    () => sections.flatMap((sec) => sec.videos),
    [sections]
  );

  const [currentVideo, setCurrentVideo] = useState(null);
  const [playedCount, setPlayedCount] = useState(0);
  const watchedVideos = useRef(new Set());

  useEffect(() => {
    if (allVideos.length) setCurrentVideo(allVideos[0]);
  }, [allVideos]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      watchedVideos.current = new Set(parsed);
      setPlayedCount(parsed.length);
    }
  }, [storageKey]);

  const handleVideoLoad = () => {
    const vid = currentVideo?.vId;
    if (vid && !watchedVideos.current.has(vid)) {
      watchedVideos.current.add(vid);
      const updated = Array.from(watchedVideos.current);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setPlayedCount(updated.length);
    }
  };

  if (!video || !currentVideo) {
    return (
      <div className="video-detail-wrap">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> 뒤로가기
        </button>
        <div className="video-area">
          <p className="empty-msg">강의 영상을 찾을 수 없습니다. 😥</p>
        </div>
      </div>
    );
  }

  const percentage = Math.round((playedCount / allVideos.length) * 100);

  let storedUserData = JSON.parse(localStorage.getItem("mypage-user-data"));
  if (!storedUserData) {
    localStorage.setItem("mypage-user-data", JSON.stringify(userData));
    storedUserData = userData;
  }



  return (
    <div className="video-detail-wrap">
      <div className="video-area">
        <button
          className="back-btn"
          onClick={() => navigate(`/detail/${video.eduId}`)}
        >
          <i className="fa-solid fa-arrow-left"></i> 강의 소개
        </button>
        <iframe
          id="edu-video"
          src={currentVideo.vUrl}
          title={currentVideo.vTit}
          frameBorder="0"
          allowFullScreen
          onLoad={handleVideoLoad}
        ></iframe>
        <div className="video-des">
          <p>{currentVideo.vTxt}</p>
        </div>
      </div>

      <div className="aside-area">
        <div className="edu-title">{video.eduTit}</div>
        <div className="edu-rate">
          진도율: {playedCount}/{allVideos.length}강 ({percentage}%)
        </div>

        {sections.map((sec, idx) => (
          <ul key={idx}>
            <h3>{sec.name.replace("section", "Section ")}</h3>
            {sec.videos.map((v) => (
              <li
                key={v.vId}
                className={`video-list ${
                  currentVideo.vId === v.vId ? "active" : ""
                }`}
              >
                <a
                  href="#"
                  className="vdeo-title"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentVideo(v);
                  }}
                >
                  <i className="fa-regular fa-circle-play"></i> {v.vTit}
                </a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default VideoDetail;
