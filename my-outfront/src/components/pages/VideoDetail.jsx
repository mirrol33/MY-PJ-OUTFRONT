import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoData from "../../js/data/video_data.json";
import "../../scss/pages/video_detail.scss";

function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storageKey = `watchedVideos_${id}`;

  const video = useMemo(() => videoData.find(v => v.eduId === Number(id)), [id]);

  // 모든 section 추출
  const sections = useMemo(() => {
    if (!video) return [];
    return Object.entries(video)
      .filter(([key, val]) => key.startsWith("section") && Array.isArray(val))
      .map(([key, val]) => ({ name: key, videos: val }));
  }, [video]);

  const allVideos = useMemo(() => sections.flatMap(sec => sec.videos), [sections]);

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
        <div className="video-des"><p>{currentVideo.vTxt}</p></div>
      </div>

      <div className="aside-area">
        <div className="edu-title">{video.eduTit}</div>
        <div className="edu-rate">
          진도율: {playedCount}/{allVideos.length}강 ({percentage}%)
        </div>

        {sections.map((sec, idx) => (
          <ul key={idx}>
            <h3>{sec.name.replace("section", "Section ")}</h3>
            {sec.videos.map(v => (
              <li key={v.vId} className={`video-list ${currentVideo.vId === v.vId ? "active" : ""}`}>
                <a
                  href="#"
                  className="vdeo-title"
                  onClick={e => {
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
