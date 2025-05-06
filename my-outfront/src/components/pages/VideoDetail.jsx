import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoData from "../../js/data/video_data.json";
import userData from "../../js/data/user_data.json";
import "../../scss/pages/video_detail.scss";

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [playedCount, setPlayedCount] = useState(0);
  const [eduRate, setEduRate] = useState(0);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState("");
  const [hasEduAccess, setHasEduAccess] = useState(false); // 🔸강의 접근 권한 상태

  const [loginSts, setLoginSts] = useState(() => {
    const saved = sessionStorage.getItem("minfo");
    return saved ? JSON.parse(saved) : null;
  });

  const video = useMemo(() => videoData.find((v) => v.eduId === Number(id)), [id]);

  const sections = useMemo(() => {
    if (!video) return [];
    return Object.entries(video)
      .filter(([key, val]) => key.startsWith("section") && Array.isArray(val))
      .map(([key, val]) => ({ name: key, videos: val }));
  }, [video]);

  const allVideos = useMemo(() => sections.flatMap((sec) => sec.videos), [sections]);

  useEffect(() => {
    if (allVideos.length > 0) {
      setCurrentVideo(allVideos[0]);
    }
  }, [allVideos]);

  // 로컬에서 유저 학습 정보 불러오기
  useEffect(() => {
    if (!loginSts) return;

    const storedUserData = JSON.parse(localStorage.getItem("mypage-user-data"));
    const userIdx = storedUserData?.findIndex((user) => user.uid === loginSts.uid);
    if (userIdx === -1 || userIdx === undefined) {
      setUserNotFoundMsg("⚠️ 로컬스토리지에서 로그인된 사용자 정보를 찾을 수 없습니다.");
      setHasEduAccess(false);
      return;
    }

    setUserNotFoundMsg("");

    const edu = storedUserData[userIdx].eduIng.find((e) => e.eduId === Number(id));
    if (!edu) {
      // 🔸 강의 정보가 없다면 구매하지 않은 상태
      setHasEduAccess(false);
      setPlayedCount(0);
      setEduRate(0);
      return;
    }

    // 🔸 구매한 상태
    setHasEduAccess(true);
    setWatchedVideos(edu.watchedVideos);
    setPlayedCount(edu.watchedVideos.length);
    setEduRate(edu.eduRate);
  }, [id, loginSts]);

  const handleVideoLoad = () => {
    const vid = currentVideo?.vId;
    if (!vid || !loginSts || !hasEduAccess) return;

    const storedUserData = JSON.parse(localStorage.getItem("mypage-user-data"));
    const userIdx = storedUserData.findIndex((user) => user.uid === loginSts.uid);
    const eduIdx = storedUserData[userIdx].eduIng.findIndex((edu) => edu.eduId === Number(id));
    const eduObj = { ...storedUserData[userIdx].eduIng[eduIdx] };

    if (eduObj.watchedVideos.includes(vid)) return;

    const newWatched = [...new Set([...eduObj.watchedVideos, vid])];
    const newRate = Math.round((newWatched.length / allVideos.length) * 100);

    eduObj.watchedVideos = newWatched;
    eduObj.eduRate = newRate;

    storedUserData[userIdx].eduIng[eduIdx] = eduObj;
    localStorage.setItem("mypage-user-data", JSON.stringify(storedUserData));

    setWatchedVideos(newWatched);
    setPlayedCount(newWatched.length);
    setEduRate(newRate);
  };

  const renderEduRate = () => {
    if (!loginSts || !hasEduAccess) return null;
    return (
      <div className="edu-rate">
        학습 진도율: {playedCount}/{allVideos.length}강 ({eduRate}%)
      </div>
    );
  };

  if (!video || !currentVideo) {
    return (
      <div className="video-detail-empty-wrap">
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
        {userNotFoundMsg && (
          <div className="warning-msg">
            <p>{userNotFoundMsg}</p>
          </div>
        )}
      </div>

      <div className="aside-area">
        <div className="edu-title">{video.eduTit}</div>
        {renderEduRate()}
        {sections.map((sec, idx) => (
          <ul key={idx}>
            <h3>{sec.name.replace("section", "Section ")}</h3>
            {sec.videos.map((v) => {
              const isSection1 = sec.name === "section1";
              const isAccessible = isSection1 || (loginSts && hasEduAccess);
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
                        alert("해당 강의는 결제 후 이용할 수 있습니다.");
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
