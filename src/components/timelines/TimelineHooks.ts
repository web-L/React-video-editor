import { useState } from "react";
import { TimeLineTrack, TimelineSegment } from './type'

// 左则头
export const LeftWidth = 80;
// 左边素材边栏
export const MaterialWidth = 388;
// 时间轴左则空隙
export const LeftGap = 16;
/** 轴尾部空隙 */
export const RightHide = 360;

export const useTimelineState = () => {
  const [timelineState, setTimelineState] = useState<{ 
    /** 总时长 */
    totalTime: number;
    /** 可以滚动内容的宽度 */
    scrollWidth: number;
    /** 内容轴的宽度 */
    contentWidth: number;
    /** 秒 尺度的宽 */
    secondWidth: number;
    /** 当前时间 */
    nowTime: number;
    /**  滚动元素的左边位置 */
    limitLeft: number;
    /**  滚动元素的左边位置 */
    limitRight: number;
    /** 滚动值 */
    scrollLeft: number;
    /** 可以滚动内容的宽度 */
    visibleWidth: number;
    /** 拖拽容器 */
    dragTrackWrap: { active: boolean, x: number, y: number }
   }>({
    totalTime: 10,
    nowTime: 1,
    scrollWidth: 700,
    contentWidth: 700,
    secondWidth: 120,
    limitLeft: LeftWidth + MaterialWidth + LeftGap,
    limitRight: 0,
    scrollLeft: 0,
    visibleWidth: 700,
    dragTrackWrap: { active: false, x: 0, y: 0 }
  });

  const updateTimelineState = (state: Partial<typeof timelineState> ) => {
    setTimelineState({
      ...timelineState,
      ...state
    })
  }

  return {
    timelineState,
    updateTimelineState
  }
};


export const useTrackList = (track: TimeLineTrack[] = []) => {
  const [trackList, setTrackList] = useState<TimeLineTrack[]>(track)

  function getSegment(id: string) {
    for (let i = 0; i < trackList.length; i++) {
      for (let j = 0; j < trackList[i].segment.length; j++) {
        if (trackList[i].segment[j].id === id) {
          return {
            prev: trackList[i].segment[j - 1],
            segment: trackList[i].segment[j],
            next: trackList[i].segment[j + 1]
          }
        }
      }
    }
  }

  function updateSegment(id: string, segment: Partial<TimelineSegment>) {
    for (let i = 0; i < trackList.length; i++) {
      for (let j = 0; j < trackList[i].segment.length; j++) {
        if (trackList[i].segment[j].id === id) {
          trackList[i].segment[j] = { ...trackList[i].segment[j], ...segment }
          setTrackList([...trackList]);
          return;
        }
      }
    }
  }

  function segmentToTrack(trackId: string, segmentId: string) {
    if (!trackId || !segmentId) return;

    for (let i = 0; i < trackList.length; i++) {
      for (let j = 0; j < trackList[i].segment.length; j++) {
        if (trackList[i].segment[j].id !== segmentId) continue;
        const segment = trackList[i].segment.splice(j, 1)[0];
        const index = trackList.findIndex(t => t.id === trackId);
        if (index !== -1) {
          trackList[index].segment.push(segment);
          trackList[index].segment.sort((a, b) => a.start - b.start);
          setTrackList([...trackList]);
        }
        return;
      }
    }
  }

  function updateTrackActive(id: string, active: boolean) {
    for (let i = 0; i < trackList.length; i++) {
      trackList[i].active = false;
      if (trackList[i].id === id) {
        trackList[i].active = active;
      }
    }
    setTrackList([...trackList]);
  }

  return {
    trackList,
    setTrackList,
    getSegment,
    updateSegment,
    updateTrackActive,
    segmentToTrack
  }
}