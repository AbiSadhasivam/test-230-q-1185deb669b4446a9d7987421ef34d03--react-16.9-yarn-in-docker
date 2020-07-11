/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

import { apiFetch } from '../../services/apiService/apiService';
import { isValidURL, isValidInput } from '../../services/utils/utils';

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
  let videoLinkChanged = (evt) => {
    setVideoLink(evt.target.value);
  };

  let settingTypeChanged = (evt) => {
    setsegmentType(evt.target.value);
    setSegmentSettings({});
  };

  // Interval related functions
  let segmentIntervalChanged = (evt) => {
    setSegmentSettings((prevState) => ({
      ...prevState,
      interval_duration: +evt.target.value,
    }));
  };

  // Segments-number related functions
  let numSegmentsChanged = (evt) => {
    setSegmentSettings((prevState) => ({
      ...prevState,
      no_of_segments: +evt.target.value,
    }));
  };

  // Range related functions
  let segmentRangeChanged = (evt) => {
    let { id, type } = evt.target.dataset;
    let rangeList = segmentSettings.interval_range;

    rangeList[id][type] = +evt.target.value;
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
  let deleteRange = (evt) => {
    let { id } = evt.target.dataset;
    let rangeList = segmentSettings.interval_range;

    rangeList.splice(id, 1);
    setSegmentSettings((prevState) => ({
      ...prevState,
      interval_range: rangeList,
    }));
  };

  // Video segmentation related function
  let getSegementedVideo = () => {
    let method = 'POST',
      apiEndpoint = process.env.REACT_APP_API_URL,
      data = {
        video_link: videoLink,
      };

    toggleLoader(true);
    setSegmentedVideos([]);

    switch (segmentType) {
      case 'Interval Duration':
        apiEndpoint = apiEndpoint + apiDetails['interval'];
        break;
      case 'Number of Segments':
        apiEndpoint = apiEndpoint + apiDetails['segments'];
        break;
      case 'Range Duration':
        apiEndpoint = apiEndpoint + apiDetails['range'];
        break;
      default: {
        console.log('nothing');
      }
    }
    data = { ...data, ...segmentSettings };
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

  // Combine segments related functions
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
    let segments = [];
    let { id, type } = evt.target.dataset;

    switch (type) {
      case 'height':
      case 'width':
        setCombineVideoSettings((prevState) => ({
          ...prevState,
          [type]: +evt.target.value,
        }));
        break;
      case 'video_url':
        segments = combineSettings['segments'];
        segments[id][type] = evt.target.value;
        setCombineVideoSettings((prevState) => ({
          ...prevState,
          segments: segments,
        }));
        break;
      default:
        segments = combineSettings['segments'];
        segments[id][type] = +evt.target.value;
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
      apiEndpoint = process.env.REACT_APP_API_URL;

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

  // Effect changes
  useEffect(() => {
    let isNotValid = false;
    switch (segmentType) {
      case 'Interval Duration':
        isNotValid =
          !isValidURL(videoLink) ||
          !isValidInput(segmentSettings['interval_duration']);
        break;
      case 'Range Duration':
        if (
          segmentSettings['interval_range'] &&
          segmentSettings['interval_range'].length
        ) {
          let segments = segmentSettings['interval_range'];

          isNotValid = false;
          isNotValid = segments.some((segment) => {
            let start = /[0-9]/.test(segment.start) ? +segment.start : -1;
            let end = /[0-9]/.test(segment.end) ? +segment.end : -1;
            if (start < 0 || end <= start) {
              return true;
            }
          });
        } else {
          isNotValid = true;
        }
        break;
      case 'Number of Segments':
        isNotValid =
          !isValidURL(videoLink) ||
          !isValidInput(segmentSettings['no_of_segments']);
        break;
      default:
    }

    isNotValid ? setDisableSegment(true) : setDisableSegment(false);
  }, [videoLink, segmentSettings, segmentType]);

  useEffect(() => {
    let isNotValid = false,
      segments = combineSettings['segments'],
      height = /[0-9]/.test(combineSettings['height'])
        ? +combineSettings['height']
        : -1,
      width = /[0-9]/.test(combineSettings['width'])
        ? +combineSettings['width']
        : -1;
    isNotValid = height <= 0 || width <= 0 ? true : false;
    if (segments.length && !isNotValid) {
      isNotValid = segments.some((segment) => {
        let video = isValidURL(segment.video_url);
        let start = /[0-9]/.test(segment.start) ? +segment.start : -1;
        let end = /[0-9]/.test(segment.end) ? +segment.end : -1;
        if (!video || start < 0 || end <= start) {
          return true;
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
