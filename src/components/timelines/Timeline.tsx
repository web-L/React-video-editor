import ReactDOM from 'react-dom';
import './Timeline.css';
import { TimelineAxios } from './TimelineAxios'
import { SyntheticEvent, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

enum TrackType {
  text = 1,
  img = 2,
  audio = 3,
  video = 4,
}
// 左则头
const LeftWidth = 80;
// 左边素材边栏
const MaterialWidth = 388;
// 时间轴左则空隙
const LeftGap = 16;

const Fix3 = (x: number) => Math.round(x * 1000) / 1000;
const Fix1 = (x: number) => Math.round(x * 10) / 10;

type TimelineSegment = {
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
type TimeLineTrack = { 
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


const useTimelineState = () => {
  const [timelineState, setTimelineState] = useState<{ 
    totalTime: number;
    secondWidth: number;
    /** 当前时间 */
    nowTime: number;
    /**  滚动元素的右边位置 */
    limitLeft: number;
    /** 滚动值 */
    scrollLeft: number;
    /** 可以滚动内容的宽度 */
    visibleWidth: number;
    /** 拖拽容器 */
    dragTrackWrap: { active: boolean, x: number, y: number }
   }>({
    nowTime: 1,
    totalTime: 10,
    secondWidth: 120,
    limitLeft: LeftWidth + MaterialWidth + LeftGap,
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

const useTrackList = (track: TimeLineTrack[] = []) => {
  const [trackList, setTrackList] = useState<TimeLineTrack[]>(track)

  function getSegment(id: string) {
    let res: TimelineSegment | undefined;
    for (let i = 0; i < trackList.length; i++) {
      res = trackList[i].segment.find(s => s.id === id)
      if (res) return res;
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
    updateTrackActive
  }
}


export function Timeline() {
  const { timelineState, updateTimelineState } = useTimelineState();
  const { trackList, getSegment, updateSegment, updateTrackActive } = useTrackList([
    {
      id: uuidv4(),
      active: false,
      type: TrackType.img,
      segment: [
        {
          id: uuidv4(),
          type: TrackType.img,
          start: 1,
          end: 2,
          dur: 1,
          source: {
            title: '综艺，符号，表情，星星，可爱',
            url: 'https://lf3-effectcdn-tos.byteeffecttos.com/obj/ies.fe.effect//9706ab28d2dad85d4bc8131c0c046a82'
          }
        },
        {
          id: uuidv4(),
          type: TrackType.text,
          start: 3,
          end: 4,
          dur: 1,
          source: {
            title: '小鸡',
            url: 'https://lf3-effectcdn-tos.byteeffecttos.com/obj/ies.fe.effect//911a4ebf43020b16bb3f9f8b7d91f4e9'
          }
        }
      ]
    },
    {
      id: uuidv4(),
      active: false,
      type: TrackType.text,
      segment: [
        {
          id: uuidv4(),
          type: TrackType.text,
          start: 3,
          end: 4,
          dur: 1,
          source: {
            title: '2843',
            url: 'https://lf3-effectcdn-tos.byteeffecttos.com/obj/ies.fe.effect//b716298a03337703057a6e320d37efd7'
          }
        }
      ]
    }
  ]);
  /** 选中片段 id */
  const [selectSegment, setSelectSegment ] = useState<{ 
    id: string;
    drag: 'drag' | 'edge-front' | 'edge-rear' | '';
    top: number;
    left: number;
    width: number;
   }>({ id: '', drag: '', top: 0, left: 0, width: 0 });
   const updateSelectSegment = (segment: Partial<typeof selectSegment>) => {
    setSelectSegment({ ...selectSegment, ...segment })
   };
  // 滚动元素的 div
  const ContentBody = useRef<HTMLDivElement>(null);

  /**
   * 通过scrollLeft计算nowTime值
   * @param dire 方向
   */
  function scrollToTime(dire: -1 | 1): number {
    timelineState.scrollLeft = ContentBody.current?.scrollLeft || 0;
    if (dire === 1) {
      // 右极限时间
      return (timelineState.scrollLeft - LeftGap + timelineState.visibleWidth) / timelineState.secondWidth;
    }
    return (timelineState.scrollLeft - LeftGap) / timelineState.secondWidth;
  }


  const sMpos: {
    id: string;
    action: 'drag' | 'edge-front' | 'edge-rear' | '';
    start: number;
    end: number;
    dur: number;
    /** 鼠标 down 下时位置对应时间  */
    time: number;
    /** 鼠标 down 下时对应需要基准时间 */
    eTime: number;
    /** 最小持续时长 */
    midDur: number;
    /** 鼠标 down 下时 X,Y 位置 */
    point: [number, number];
    /** 鼠标 down 下时 场景页时长 */
    totalTime: number;
    /** 滚动条 滚动值 */
    scroll: number;
    /** 左极限 时间值 */
    ml: number;
    /** 右极限 时间值 -1 是没有极限 */
    mr: number;
    /** 是否有改变时间 */
    change: number;
    box: BBox
  } = {
    id: '',
    action: 'drag',
    start: 0,
    end: 0,
    dur: 0,
    time: 0,
    eTime: 0,
    midDur: 0.1,
    point: [0, 0],
    totalTime: 0,
    scroll: 0,
    ml: 0,
    mr: 0,
    change: 0,
    box: { x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0 }
  }

  function onSelectionDown(e: PointerEvent): void {
    const dataset = (e.target as HTMLDivElement).dataset;
    const action = dataset.action || '';
    const segment = getSegment(dataset.id || '')

    if (action === '' || !segment) return;

    const segBox = ((e.target as HTMLDivElement).parentNode as HTMLDivElement).getBoundingClientRect();
    updateSelectSegment({ id: dataset.id || '', drag: '' });
    updateTrackActive(dataset.trackid || '', true);
    sMpos.id = dataset.id || '';
    sMpos.action = action as 'drag' | 'edge-front' | 'edge-rear';
    
    sMpos.point = [e.clientX, e.clientY - segBox.top]
    sMpos.box = { x: segBox.x, y: segBox.y, w: segBox.width, h: segBox.height, cx: segBox.width / 2, cy: segBox.height / 2 };
    sMpos.time = (e.pageX - timelineState.limitLeft) / timelineState.secondWidth + scrollToTime(-1);
    sMpos.start = segment.start;
    sMpos.end = segment.end;
    sMpos.dur = segment.dur;

    switch (sMpos.action) {
      case 'drag':
        {
          sMpos.eTime = segment.start;
          sMpos.ml = 0;
          sMpos.mr = -1;

          updateTimelineState({ dragTrackWrap: { 
            active: false,
            x: sMpos.eTime * timelineState.secondWidth + timelineState.limitLeft,
            y: e.clientY - sMpos.point[1]
          } });
        }
        break;
      case 'edge-front':
        {
          sMpos.eTime = segment.start;
          sMpos.ml = 0;
          sMpos.mr = Fix3(segment.end - Math.max(0.1, sMpos.midDur));
        }
        break
      case 'edge-rear':
        {
          sMpos.eTime = segment.end;
          sMpos.ml = segment.start + Math.max(0.1, sMpos.midDur);
          sMpos.mr = -1;
        }
        break
    }

    document.addEventListener('pointermove', onSelectionMove, false);
    document.addEventListener('pointerup', onSelectionUp, false);

  }

  function onSelectionMove(e: PointerEvent) {
    e.preventDefault();

    const x = e.clientX;
    const time = scrollToTime(-1) + (e.pageX - timelineState.limitLeft) / timelineState.secondWidth;
    sMpos.change = x - sMpos.point[0];

    /** eTime 新的基准点 时间 */
    let eTime = Fix1(sMpos.eTime + (time - sMpos.time));
    if (eTime < sMpos.ml) {
      eTime = sMpos.ml;
    }
    if (sMpos.mr > 0 && eTime > sMpos.mr) {
      eTime = sMpos.mr;
    }

    switch (sMpos.action) {
      case 'drag':
        {
          sMpos.start = eTime;
          sMpos.end = eTime + sMpos.dur;
          
          updateSelectSegment({ id: sMpos.id, drag: sMpos.action})
          updateTimelineState({ dragTrackWrap: { 
            active: true,
            x: eTime * timelineState.secondWidth + timelineState.limitLeft,
            y: e.clientY - sMpos.point[1]
          } });
        }
        break;
      case 'edge-front':
        {
          sMpos.start = eTime;
          sMpos.dur = sMpos.end - eTime;
          updateSelectSegment({ 
            id: sMpos.id,
            drag: sMpos.action,
            left: sMpos.start * timelineState.secondWidth,
            width: sMpos.dur * timelineState.secondWidth
          });
        }
        break;
      case 'edge-rear':
        {
          const dur = eTime - sMpos.start;
          sMpos.end = eTime;
          sMpos.dur = dur;
          
          updateSelectSegment({
            id: sMpos.id,
            drag: sMpos.action,
            left: sMpos.start * timelineState.secondWidth,
            width: dur * timelineState.secondWidth
          });
        }
        break;
    }
  }
  
  function onSelectionUp(e: PointerEvent) {
    e.preventDefault();
    document.removeEventListener('pointermove', onSelectionMove);
    document.removeEventListener('pointerup', onSelectionUp);

    switch (sMpos.action) {
      case 'drag':
        {
          updateSegment(sMpos.id, { start: sMpos.start, end: sMpos.end, dur: sMpos.end - sMpos.start });
        }
        break;
      case 'edge-front':
      case 'edge-rear':
        {
          updateSegment(sMpos.id, { start: sMpos.start, end: sMpos.start + sMpos.dur, dur: sMpos.dur });
        }
        break;
    }
    
    updateSelectSegment({ id: sMpos.id, drag: ''});
    sMpos.action = '';
  }
  
  return (
    <>
      <div className="timeline">
      
        <div className="timeline-hd">

          <div className="track-operation">
            {
              trackList.map(t => (<div className="track-operation-item type-sticker" key={ t.id }></div>))
            }
            <div className="track-operation-item type-video primary">
              <button className="arco-btn arco-btn-text arco-btn-size-mini arco-btn-shape-square" type="button">
                <svg
                  width="1em" height="1em" viewBox="0 0 16 16" preserveAspectRatio="xMidYMid meet"
                  fill="none" role="presentation" xmlns="http://www.w3.org/2000/svg"
                  className="iconpark-icon">
                  <g>
                    <path d="M10.4 14.78a7.203 7.203 0 0 0 0-13.58v1.73a5.6 5.6 0 0 1 0 10.121v1.73ZM6.025 1.64H7.95v12.7H6.025l-.225-.3-.72-.96a4.85 4.85 0 0 0-3.88-1.94H.05v-6.3H1.2A4.85 4.85 0 0 0 5.08 2.9l.72-.96.225-.3Zm.425 1.934-.17.226a6.35 6.35 0 0 1-4.73 2.53v3.32a6.35 6.35 0 0 1 4.73 2.53l.17.227V3.574ZM12 7.99c0 1.308-.628 2.47-1.6 3.2v-6.4c.972.73 1.6 1.891 1.6 3.2Z"
                            clipRule="evenodd" fillRule="evenodd" data-follow-fill="currentColor"
                            fill="currentColor"></path>
                      </g>
                  </svg>
                </button>
              </div>
          </div>

        </div>

        <div className="timeline-bd">

          <div className='content-scroll-body' ref={ ContentBody } style={{ width: '1524.1px' }}>

            {/* --------------- 时间轴刻度 ----------- */}
            <TimelineAxios totalTimeInt={timelineState.totalTime} secondWidth={timelineState.secondWidth}/>
            
            {/* --------------- 时间轴轨道容器 ----------- */}
            <div className='track-wrapper' onPointerDown={ (e: SyntheticEvent) => onSelectionDown(e as unknown as PointerEvent) }>

              {/* --------------- 时间轴轨道列表----------- */}
              <div className='track-list'>

                {
                  trackList.map((track, index) => {
                    return (
                      <div className={ `track type-sticker ${ track.active ? 'selected' : '' }` } data-index={ index } data-id={ track.id } key={ track.id }>

                        <div className="track-placeholder-wrapper"></div>
                        {
                          track.segment.map((s, i) => {
                            if (selectSegment.id === s.id && selectSegment.drag === 'drag') {
                              return (
                                <TimelineDragTrackComponent 
                                  key={ s.id }
                                  active={ timelineState.dragTrackWrap.active }
                                  x={ timelineState.dragTrackWrap.x }
                                  y={ timelineState.dragTrackWrap.y }>
                                  <SegmentComponent
                                    key={ s.id }
                                    track={ track }
                                    active={ false }
                                    s={ s }
                                    i={ i }
                                    left={ 0 }
                                    width={timelineState.secondWidth * s.dur} />
                                </TimelineDragTrackComponent>
                              )
                            } else if (selectSegment.id === s.id && (selectSegment.drag === 'edge-front' || selectSegment.drag === 'edge-rear')){
                              return (<SegmentComponent
                                key={ s.id }
                                active={ true }
                                track={ track }
                                s={ s }
                                i={ i }
                                left={ selectSegment.left }
                                width={ selectSegment.width } />)
                            } {
                              return (<SegmentComponent
                                key={ s.id }
                                track={ track }
                                active={ selectSegment.id === s.id }
                                s={ s }
                                i={ i }
                                left={ s.start * timelineState.secondWidth }
                                width={timelineState.secondWidth * s.dur} />)
                            }
                          })   
                        }
                      </div>
                    )
                  })
                }

              </div>
              
            </div>
          </div>

        </div>

      </div>
    </>
  )
}

const TimelineDragTrackComponent: React.FC<{
  active: boolean,
  x: number,
  y: number,
  children?: React.ReactNode 
}> = (props) => {
  const { active, x, y } = props;

  return ReactDOM.createPortal(
    (<div className='track-drag-container' style={{ display: active ? 'block' : 'none' , left: `${x}px`, top: `${y}px` }}>
      { props.children }
    </div>),
    document.body
  )
}

interface SegmentProps {
  active: boolean;
  track: TimeLineTrack
  s: TimelineSegment;
  i: number;
  width: number;
  left: number;
}

const SegmentComponent: React.FC<SegmentProps> = ({ active, s, i, left, width, track}) => (
  <div className='segment type-sticker' data-id={ s.id } data-index={ i } style={{
    left,
    width
  }}>
    <div className="segment-rc-emitter" data-action="drag" data-id={ s.id } data-trackid={ track.id }>
      <div className="segment-edge segment-edge-front cursor-segment-front" style={{ width: '2px' }}></div>
      <div className="segment-edge segment-edge-rear cursor-segment-rear" style={{ width: '2px' }}></div>
    </div>
    <div className={ `segment-active-box ${ active ? 'active' : '' }` } style={{ left: '0px', right: '0px' }}>
      <div className="segment-active-box-edge front cursor-segment-front" data-id={ s.id } data-action="edge-front"></div>
      <div className="segment-active-box-edge rear cursor-segment-rear" data-id={ s.id } data-action="edge-rear"></div>
    </div>
    <div className="segment-hd">
      <div className="segment-hd-group">
        <img src={ s.source.url } className="segment-icon-image" draggable="false" />
        <div className="segment-title">{ s.source.title }</div>
      </div>
    </div>
  </div>
);