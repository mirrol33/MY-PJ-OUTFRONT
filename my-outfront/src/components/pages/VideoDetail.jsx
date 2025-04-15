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

  const video = useMemo(
    () => videoData.find((v) => v.eduId === Number(id)),
    [id]
  );

  const sections = useMemo(() => {
    if (!video) return [];
    return Object.entries(video)
      .filter(([key, val]) => key.startsWith("section") && Array.isArray(val))
      .map(([key, val]) => ({ name: key, videos: val }));
  }, [video]);

  const allVideos = useMemo(() => sections.flatMap((sec) => sec.videos), [sections]);

  // 첫 영상 자동 선택
  useEffect(() => {
    if (allVideos.length > 0) {
      setCurrentVideo(allVideos[0]);
    }
  }, [allVideos]);

  // 기존 시청 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setWatchedVideos(parsed);
      setPlayedCount(parsed.length);
      console.log("[로드] watchedVideos:", parsed);
    }
  }, [storageKey]);

  const handleVideoLoad = () => {
    const vid = currentVideo?.vId;
    if (!vid || watchedVideos.includes(vid)) return;

    // 1. watchedVideos 상태 및 localStorage 업데이트
    const updatedVideos = [...watchedVideos, vid];
    const uniqueVideos = [...new Set(updatedVideos)];
    setWatchedVideos(uniqueVideos);
    setPlayedCount(uniqueVideos.length);
    localStorage.setItem(storageKey, JSON.stringify(uniqueVideos));
    console.log("[시청 업데이트] watchedVideos 저장:", uniqueVideos);

    // 2. 로그인 사용자 정보 가져오기 (SessionStorage)
    const minfo = JSON.parse(sessionStorage.getItem("minfo"));
    if (!minfo) {
      console.warn("세션스토리지에서 로그인 정보를 찾을 수 없습니다.");
      return;
    }
    console.log("[유저 정보] minfo:", minfo);

    // 3. 유저 데이터 불러오기
    let storedUserData = JSON.parse(localStorage.getItem("mypage-user-data"));
    if (!storedUserData) {
      storedUserData = userData; // 기본 더미 데이터 사용
      console.log("[초기화] 로컬 유저 데이터가 없어서 userData 사용");
    }

    // 4. 현재 로그인 유저 찾기
    const userIdx = storedUserData.findIndex((user) => user.uid === minfo.uid);
    if (userIdx === -1) {
      console.warn("해당 uid를 가진 유저가 없습니다:", minfo.uid);
      return;
    }

    const user = { ...storedUserData[userIdx] };
    const eduIdx = user.eduIng.findIndex((edu) => edu.eduId === Number(id));
    if (eduIdx === -1) {
      console.warn("현재 강의가 유저 eduIng에 없습니다:", id);
      return;
    }

    // 5. 강의 정보 업데이트
    const eduObj = { ...user.eduIng[eduIdx] };
    const newWatched = [...new Set([...eduObj.watchedVideos, vid])];
    const newRate = Math.round((newWatched.length / allVideos.length) * 100);

    eduObj.watchedVideos = newWatched;
    eduObj.eduRate = newRate;

    console.log("[진도 업데이트] watchedVideos:", newWatched);
    console.log("[진도 업데이트] eduRate:", newRate);

    user.eduIng[eduIdx] = eduObj;
    storedUserData[userIdx] = user;

    // 6. 업데이트된 사용자 데이터 저장
    localStorage.setItem("mypage-user-data", JSON.stringify(storedUserData));
    console.log("[저장 완료] localStorage.mypage-user-data 업데이트");
  };

  const percentage = Math.round((playedCount / allVideos.length) * 100);

  if (!video || !currentVideo) {
    return (
      <div className="empty">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> 뒤로가기
        </button>
        <div className="video-area">
          <p className="empty-msg">아직 강의 영상을 준비중입니다. 나중에 다시 이용해주세요. 😥</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-detail-wrap">
      <div className="video-area">
        <button className="back-btn" onClick={() => navigate(`/detail/${video.eduId}`)}>
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
            {sec.videos.map((v) => (
              <li
                key={v.vId}
                className={`video-list ${currentVideo.vId === v.vId ? "active" : ""}`}
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
