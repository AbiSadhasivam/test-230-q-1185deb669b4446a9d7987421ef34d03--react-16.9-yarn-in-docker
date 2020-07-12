import React from 'react';
import './VideoList.css';
function VideoList(props) {
  let videos = props['video-list'];
  let width = props.width || 300;
  let height = props.height || 300;
  let videoName = props['video-name'];
  let srcName = props['src-name'];
  let type = props.type || 'segment';
  if (type === 'combine') {
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
  return videos.map((vid, idx) => (
    <video
      key={'vid' + idx}
      width={width}
      height={height}
      controls
      className={videoName + Number(idx + 1) + ' video-ctr'}
    >
      <source
        src={vid.video_url}
        type='video/mp4'
        className={srcName + Number(idx + 1)}
      ></source>
    </video>
  ));
}

export default VideoList;
