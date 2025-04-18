import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoData from "../../js/data/video_data.json";
import userData from "../../js/data/user_data.json";
import "../../scss/pages/video_detail.scss";

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storageKey = `watchedVideos_${id}`;

  const [currentVideo, setCurrentVideo] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [playedCount, setPlayedCount] = useState(0);

  // ✅ 로그인 상태
  const [loginSts, setLoginSts] = useState(() => {
    const saved = sessionStorage.getItem("minfo");
    return saved ? JSON.parse(saved) : null;
  });

  // ✅ 현재 강의 데이터
  const video = useMemo(() => {
    return videoData.find((v) => v.eduId === Number(id));
  }, [id]);

  // ✅ 섹션 목록
  const sections = useMemo(() => {
    if (!video) return [];
    return Object.entries(video)
      .filter(([key, val]) => key.startsWith("section") && Array.isArray(val))
      .map(([key, val]) => ({ name: key, videos: val }));
  }, [video]);

  // ✅ 전체 강의 목록
  const allVideos = useMemo(() => {
    return sections.flatMap((sec) => sec.videos);
  }, [sections]);

  // ✅ 첫 번째 영상 선택
  useEffect(() => {
    if (allVideos.length > 0) {
      setCurrentVideo(allVideos[0]);
    }
  }, [allVideos]);

  // ✅ 로컬스토리지에서 기존 시청 영상 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setWatchedVideos(parsed);
      setPlayedCount(parsed.length);
      console.log("[로드] watchedVideos:", parsed);
    }
  }, [storageKey]);

  // ✅ 영상 로드될 때 시청 기록 처리
  const handleVideoLoad = () => {
    const vid = currentVideo?.vId;
    if (!vid || watchedVideos.includes(vid)) return;

    // 로그인 안 된 상태면 시청 기록 저장 안함
    if (!loginSts) {
      console.warn("로그인이 필요합니다.");
      return;
    }

    // 1. watchedVideos 상태 및 localStorage 업데이트
    const updatedVideos = [...new Set([...watchedVideos, vid])];
    setWatchedVideos(updatedVideos);
    setPlayedCount(updatedVideos.length);
    localStorage.setItem(storageKey, JSON.stringify(updatedVideos));
    console.log("[시청 업데이트] watchedVideos 저장:", updatedVideos);

    // 2. 유저 데이터 가져오기
    let storedUserData = JSON.parse(localStorage.getItem("mypage-user-data"));
    if (!storedUserData) {
      storedUserData = userData;
      console.log("[초기화] userData로 초기화");
    }

    // 3. 로그인된 유저 찾기
    const userIdx = storedUserData.findIndex(
      (user) => user.uid === loginSts.uid
    );
    if (userIdx === -1) {
      console.warn("로그인된 uid를 찾을 수 없습니다:", loginSts.uid);
      return;
    }

    const user = { ...storedUserData[userIdx] };
    const eduIdx = user.eduIng.findIndex((edu) => edu.eduId === Number(id));
    if (eduIdx === -1) {
      console.warn("강의 정보 없음:", id);
      return;
    }

    // 4. 시청 진도 업데이트
    const eduObj = { ...user.eduIng[eduIdx] };
    const newWatched = [...new Set([...eduObj.watchedVideos, vid])];
    const newRate = Math.round((newWatched.length / allVideos.length) * 100);

    eduObj.watchedVideos = newWatched;
    eduObj.eduRate = newRate;

    user.eduIng[eduIdx] = eduObj;
    storedUserData[userIdx] = user;

    // 5. localStorage 저장
    localStorage.setItem("mypage-user-data", JSON.stringify(storedUserData));
    console.log("[저장 완료] 유저 진도 업데이트 완료:", newRate + "%");
  };

  const percentage = Math.round((playedCount / allVideos.length) * 100);

  if (!video || !currentVideo) {
    return (
      <div className="empty">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> 뒤로가기
        </button>
        <div className="video-area">
          <p className="empty-msg">
            아직 강의 영상을 준비 중입니다. 나중에 다시 이용해주세요. 😥
          </p>
        </div>
      </div>
    );
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
          학습 진도율: {playedCount}/{allVideos.length}강 ({percentage}%)
        </div>

        {sections.map((sec, idx) => (
          <ul key={idx}>
            <h3>{sec.name.replace("section", "Section ")}</h3>
            {sec.videos.map((v) => {
              const isSection1 = sec.name === "section1";
              const isAccessible = loginSts || isSection1;
              return (
                <li
                  key={v.vId}
                  className={`video-list ${
                    currentVideo.vId === v.vId ? "active" : ""
                  } ${!isAccessible ? "disabled" : ""}`}
                >
                  <a
                    href="#"
                    className="vdeo-title"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isAccessible) {
                        alert("로그인 후 시청할 수 있는 영상입니다.");
                        return;
                      }
                      setCurrentVideo(v);
                    }}
                  >
                    <i className="fa-regular fa-circle-play"></i> {v.vTit}
                  </a>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default VideoDetail;
