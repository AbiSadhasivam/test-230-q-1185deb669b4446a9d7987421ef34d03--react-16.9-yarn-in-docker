import React from 'react';
import './VideoList.css';
function videoComponent(width, height, videoName, srcName, videos) {
  return (
    <video
      width={width}
      height={height}
      controls
      className={videoName + ' video-ctr'}
    >
      <source
        src={videos.video_url}
        type='video/mp4'
        className={srcName}
      ></source>
    </video>
  );
}
function VideoList(props) {
  let videos = props['video-list'];
  let width = props.width || 300;
  let height = props.height || 300;
  let videoName = props['video-name'];
  let srcName = props['src-name'];
  let type = props.type || 'segment';
  if (type === 'combine') {
    return videoComponent(width, height, videoName, srcName, videos);
  }
  return videos.map((vid, idx) =>
    videoComponent(
      width,
      height,
      videoName + Number(idx + 1),
      srcName + Number(idx + 1),
      vid
    )
  );
}

export default VideoList;
