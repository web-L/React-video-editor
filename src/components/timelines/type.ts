
export enum TrackType {
  text = 1,
  img = 2,
  audio = 3,
  video = 4,
}

export type TimelineSegment = {
  id: string;
  type: TrackType;
  start: number;
  end: number;
  dur: number;
  source: {
    title: string;
    url?: string;
    content?: string;
  };
}
export type TimeLineTrack = { 
  id: string;
  active: boolean;
  type: TrackType;
  segment: TimelineSegment[]
}
/**
 * 用于计算的元素盒子数据
 * @property w 宽
 * @property h 高
 * @property x left
 * @property y top
 * @property r 旋转
 * @property cx 中心点x
 * @property cy 中心点y
 */
export type BBox = {
  w: number;
  h: number;
  x: number;
  y: number;
  cx: number;
  cy: number;
};