import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

import { apiFetch } from '../../services/apiService/apiService';
import { isValidURL, isValidInterval } from '../../services/utils/utils';

import Loader from '../Spinner/Spinner';
import apiDetails from '../../constants/constants';
import toast from '../Toast/Toast';
import VideoList from '../VideoList/VideoList';

import './SegmentVideo.css';

function SegmentVideo() {
  const [videoLink, setVideoLink] = useState();
  const [segmentType, setsegmentType] = useState('Interval Duration');
  const [segmentSettings, setSegmentSettings] = useState({});
  const [segmentedVideos, setSegmentedVideos] = useState([]);
  const [combinedVideo, setCombinedVideo] = useState();
  const [disableSegment, setDisableSegment] = useState(true);
  const [disableCombine, setDisableCombine] = useState(true);
  const [combineSettings, setCombineVideoSettings] = useState({
    segments: [],
    height: '',
    width: '',
  });

  const [showLoader, setLoaderVisiblity] = useState(false);

  // Visiblity

  let toggleLoader = (isVisible) => {
    setLoaderVisiblity(isVisible);
  };

  let settingTypeChanged = (evt) => {
    setsegmentType(evt.target.value);
    setSegmentSettings({});
  };
  let segmentIntervalChanged = (evt) => {
    let val = Number(evt.target.value);
    setSegmentSettings((prevState) => ({
      ...prevState,
      interval_duration: val,
    }));
  };
  let numSegmentsChanged = (evt) => {
    let val = Number(evt.target.value);
    setSegmentSettings((prevState) => ({
      ...prevState,
      no_of_segments: val,
    }));
  };
  let segmentRangeChanged = (evt) => {
    let val = Number(evt.target.value);
    let { id, type } = evt.target.dataset;
    let rangeList = segmentSettings.interval_range;
    rangeList[id][type] = val;
    setSegmentSettings((prevState) => ({
      ...prevState,
      interval_range: rangeList,
    }));
  };
  let addRangeDuration = (evt) => {
    let rangeList = segmentSettings['interval_range'] || [];
    rangeList.push({
      start: '',
      end: '',
    });
    setSegmentSettings((prevState) => ({
      ...prevState,
      interval_range: rangeList,
    }));
  };
  let getSegementedVideo = () => {
    toggleLoader(true);
    let method = 'POST',
      apiEndpoint = process.env.REACT_APP_API_URL,
      data = {
        video_link: videoLink,
      };

    setSegmentedVideos([]);
    switch (segmentType) {
      case 'Interval Duration':
        data = { ...data, ...segmentSettings };
        apiEndpoint = apiEndpoint + apiDetails['interval'];
        break;
      case 'Number of Segments':
        data = { ...data, ...segmentSettings };
        apiEndpoint = apiEndpoint + apiDetails['segments'];
        break;
      case 'Range Duration':
        data = { ...data, ...segmentSettings };
        apiEndpoint = apiEndpoint + apiDetails['range'];
        break;
      default: {
        console.log('nothing');
      }
    }
    apiFetch(apiEndpoint, method, data).then(
      (data) => {
        toggleLoader(false);
        if (data) {
          toast.success('Succesfully segmented the video');
          setSegmentedVideos(data.interval_videos);
        }
      },
      (err) => {
        toggleLoader(false);
        toast.error('Error in combining the video');
      }
    );
  };
  let videoLinkChanged = (evt) => {
    setVideoLink(evt.target.value);
  };
  let deleteRange = (evt) => {
    let { id } = evt.target.dataset;
    let rangeList = segmentSettings.interval_range;

    rangeList.splice(id, 1);
    setSegmentSettings((prevState) => ({
      ...prevState,
      interval_range: rangeList,
    }));
  };
  let addVideo = (evt) => {
    let combineVideoList = combineSettings.segments;
    combineVideoList.push({
      video_url: '',
      start: '',
      end: '',
    });
    setCombineVideoSettings((prevState) => ({
      ...prevState,
      segments: combineVideoList,
    }));
  };
  let combineSettingsChanged = (evt) => {
    let val = '';
    let segments = [];
    let { id, type } = evt.target.dataset;
    switch (type) {
      case 'height':
      case 'width':
        val = evt.target.value;
        setCombineVideoSettings((prevState) => ({
          ...prevState,
          [type]: val,
        }));
        break;
      case 'video_url':
        segments = combineSettings['segments'];
        val = evt.target.value;
        segments[id][type] = val;
        setCombineVideoSettings((prevState) => ({
          ...prevState,
          segments: segments,
        }));
        break;
      default:
        segments = combineSettings['segments'];
        val = +evt.target.value;
        segments[id][type] = val;
        setCombineVideoSettings((prevState) => ({
          ...prevState,
          segments: segments,
        }));
    }
  };
  let deleteSegment = (evt) => {
    let { id } = evt.target.dataset;
    let segmentList = combineSettings.segments;

    segmentList.splice(id, 1);
    setSegmentSettings((prevState) => ({
      ...prevState,
      segments: segmentList,
    }));
  };
  let getCombinedVideo = () => {
    let method = 'POST',
      apiEndpoint = apiDetails['apiEndpoint'];
    apiEndpoint = apiEndpoint + 'combine-video';
    toggleLoader(true);
    apiFetch(apiEndpoint, method, combineSettings).then(
      (data) => {
        toggleLoader(false);
        if (data) {
          toast.success('Succesfully combined the video');
          setCombinedVideo(data);
        }
      },
      (err) => {
        toggleLoader(false);
        toast.error('Error in combining the video');
      }
    );
  };

  useEffect(() => {
    let isNotValid = false;
    switch (segmentType) {
      case 'Interval Duration':
        isNotValid =
          !isValidURL(videoLink) ||
          !isValidInterval(segmentSettings['interval_duration']);
        break;
      case 'Range Duration':
        if (
          segmentSettings['interval_range'] &&
          segmentSettings['interval_range'].length
        ) {
          isNotValid = false;
          let startArr = segmentSettings['interval_range'].map((range) => {
            return range.start;
          });
          let endArr = segmentSettings['interval_range'].map((range) => {
            return range.end;
          });
          startArr.forEach((element, id) => {
            let start = /[0-9]/.test(element) ? Number(element) : null;
            let end = /[0-9]/.test(endArr[id]) ? Number(endArr[id]) : null;
            if (start < 0 || end <= start || start === null || end === null) {
              isNotValid = true;
            }
          });
        } else {
          isNotValid = true;
        }
        break;
      case 'Number of Segments':
        isNotValid =
          !isValidURL(videoLink) ||
          !isValidInterval(segmentSettings['no_of_segments']);
        break;
      default: {
        console.log('nothing');
      }
    }

    isNotValid ? setDisableSegment(true) : setDisableSegment(false);
  }, [videoLink, segmentSettings, segmentType]);

  useEffect(() => {
    let isNotValid = false,
      segments = combineSettings['segments'],
      height = /[0-9]/.test(combineSettings['height'])
        ? +combineSettings['height']
        : null,
      width = /[0-9]/.test(combineSettings['width'])
        ? +combineSettings['width']
        : null;
    isNotValid =
      height === null || width === null || height <= 0 || width <= 0
        ? true
        : false;
    if (segments.length && !isNotValid) {
      let videoArr = segments.map((video) => {
        return video.video_url;
      });
      let startArr = segments.map((video) => {
        return video.start;
      });
      let endArr = segments.map((video) => {
        return video.end;
      });
      startArr.forEach((element, idx) => {
        let video = isValidURL(videoArr[idx]);
        let start = /[0-9]/.test(element) ? +element : null;
        let end = /[0-9]/.test(endArr[idx]) ? +endArr[idx] : null;
        if (
          !video ||
          start < 0 ||
          end <= start ||
          start === null ||
          end === null
        ) {
          isNotValid = true;
        }
      });
    } else {
      isNotValid = true;
    }

    isNotValid ? setDisableCombine(true) : setDisableCombine(false);
  }, [combineSettings]);

  return (
    <>
      {showLoader && <Loader></Loader>}
      <div className='container'>
        <div className='seg-container'>
          <div className='header'>Segment Video</div>
          <hr />
          <div>
            <Form>
              <FormGroup>
                <Label className='inputLabel' for='videoLink'>
                  Video Link...
                </Label>
                <Input
                  type='text'
                  name='link'
                  id='videoLink'
                  className='video-link'
                  onChange={videoLinkChanged}
                />
              </FormGroup>
              <FormGroup>
                <Label className='inputLabel' for='selectSettings'>
                  Select segment settings
                </Label>
                <Input
                  type='select'
                  className='segment-setting'
                  name='select'
                  id='selectSettings'
                  onChange={settingTypeChanged}
                >
                  <option value='Interval Duration'>Interval Duration</option>
                  <option value='Range Duration'>Range Duration</option>
                  <option value='Number of Segments'>Number of Segments</option>
                </Input>
              </FormGroup>
              {segmentType === 'Interval Duration' && (
                <FormGroup>
                  <Label className='inputLabel' for='videoLink'>
                    Interval Duration(in seconds)...
                  </Label>
                  <Input
                    type='number'
                    name='interval'
                    id='intervalDuration'
                    className='interval-duration'
                    onChange={segmentIntervalChanged}
                  />
                </FormGroup>
              )}
              {segmentType === 'Range Duration' && (
                <div>
                  <Button
                    className='btn add-range-duration'
                    onClick={addRangeDuration}
                  >
                    Add Range Duration
                  </Button>
                  {segmentSettings['interval_range'] &&
                    segmentSettings['interval_range'].map((range, id) => (
                      <FormGroup className='range-group' key={'interval-' + id}>
                        <div className='group'>
                          <Label className='inputLabel' for='range-start'>
                            Range Duration Start
                          </Label>
                          <Input
                            type='number'
                            name='range-start'
                            id='range-start'
                            className={'range-duration-start-' + Number(id + 1)}
                            data-id={id}
                            data-type='start'
                            value={range.start}
                            onChange={segmentRangeChanged}
                          />
                        </div>
                        <div className='group'>
                          <Label className='inputLabel' for='range-end'>
                            Range Duration Start
                          </Label>
                          <Input
                            type='number'
                            name='range-end'
                            id='range-end'
                            data-id={id}
                            data-type='end'
                            value={range.end}
                            className={'range-duration-end-' + Number(id + 1)}
                            onChange={segmentRangeChanged}
                          />
                        </div>
                        <div className='group'>
                          <Button
                            className={
                              'btn delete-range-duration-' + Number(id + 1)
                            }
                            data-id={id}
                            onClick={deleteRange}
                          >
                            Delete
                          </Button>
                        </div>
                      </FormGroup>
                    ))}
                </div>
              )}
              {segmentType === 'Number of Segments' && (
                <FormGroup>
                  <Label className='inputLabel' for='videoLink'>
                    Number of Segments...
                  </Label>
                  <Input
                    type='number'
                    name='interval'
                    id='noOfSegments'
                    className='num-segments'
                    onChange={numSegmentsChanged}
                  />
                </FormGroup>
              )}
              <Button
                className='btn process-video'
                disabled={disableSegment}
                onClick={getSegementedVideo}
              >
                Segment Video
              </Button>
            </Form>
          </div>
          <div className='d-flex justify-content-center align-items-center'>
            {segmentedVideos.length > 0 && (
              <VideoList
                video-list={segmentedVideos}
                video-name='segmented-video-'
                src-name='segmented-video-source-'
              ></VideoList>
            )}
          </div>
        </div>
        <div className='seg-container'>
          <div className='header'>Combine Video</div>
          <hr />
          <Button className='btn add-video' onClick={addVideo}>
            Add Video
          </Button>
          {combineSettings['segments'] &&
            combineSettings['segments'].map((video, id) => (
              <FormGroup className='range-group' key={'range-' + id}>
                <div className='group'>
                  <Label className='inputLabel' for='video-link'>
                    Video Link...
                  </Label>
                  <Input
                    type='text'
                    name='videoLink'
                    id='video-link'
                    className={'combine-video-' + Number(id + 1)}
                    data-id={id}
                    data-type='video_url'
                    value={video.video_url}
                    onChange={combineSettingsChanged}
                  />
                </div>
                <div className='group'>
                  <Label className='inputLabel' for='combine-start'>
                    Start at(in Sec)
                  </Label>
                  <Input
                    type='number'
                    name='combine-start'
                    id='combine-start'
                    className={
                      'combine-video-range-duration-start-' + Number(id + 1)
                    }
                    data-id={id}
                    data-type='start'
                    value={video.start}
                    onChange={combineSettingsChanged}
                  />
                </div>
                <div className='group'>
                  <Label className='inputLabel' for='combine-end'>
                    End at(in Sec)
                  </Label>
                  <Input
                    type='number'
                    name='combine-end'
                    id='combine-end'
                    className={
                      'combine-video-range-duration-end-' + Number(id + 1)
                    }
                    data-id={id}
                    data-type='end'
                    value={video.end}
                    onChange={combineSettingsChanged}
                  />
                </div>
                <div className='group'>
                  <Button
                    className={'btn delete-range-duration-' + Number(id + 1)}
                    data-id={id}
                    onClick={deleteSegment}
                  >
                    Delete
                  </Button>
                </div>
              </FormGroup>
            ))}
          <FormGroup className='range-group'>
            <div className='group'>
              <Label className='inputLabel' for='video-height'>
                Video Height...
              </Label>
              <Input
                type='number'
                name='video-height'
                id='video-height'
                className='video-height'
                data-type='height'
                value={combineSettings.height}
                onChange={combineSettingsChanged}
              />
            </div>
            <div className='group'>
              <Label className='inputLabel' for='video-width'>
                Video width...
              </Label>
              <Input
                type='number'
                name='video-width'
                id='video-width'
                className='video-width'
                data-type='width'
                value={combineSettings.width}
                onChange={combineSettingsChanged}
              />
            </div>
          </FormGroup>
          <Button
            className='btn combine-video'
            disabled={disableCombine}
            onClick={getCombinedVideo}
          >
            Combine Video
          </Button>
          <div className='d-flex justify-content-center align-items-center'>
            {combinedVideo && (
              <VideoList
                video-list={combinedVideo}
                video-name='combined-video'
                src-name='combined-video-source'
                width={combineSettings.width}
                height={combineSettings.height}
                type='combine'
              ></VideoList>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SegmentVideo;
