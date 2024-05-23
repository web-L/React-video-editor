import { v4 as uuidv4 } from 'uuid';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import './Timeline.css';
import { TrackType } from './type';
import { TimelineAxios } from './TimelineAxios'
import { useTimelineState, LeftGap, useTrackList, RightHide} from './TimelineHooks';
import { TimelineDragTrackComponent } from './TimelineDragTrack';
import { SegmentComponent } from './TimelineSegment';


const Fix3 = (x: number) => Math.round(x * 1000) / 1000;
const Fix1 = (x: number) => Math.round(x * 10) / 10;

/** 计算元素重叠率 */
function calculateOverlapRatio(rect1: DOMRect, rect2: DOMRect) {
  const overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
  let overlapArea = 0;
  // 计算重叠部分的面积
  if (overlap) {
    const overlapWidth = Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left);
    const overlapHeight = Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top);
    overlapArea = overlapWidth * overlapHeight;
  } else {
    overlapArea = 0;
  }

  // 计算总面积
  const totalArea = rect1.width * rect1.height + rect2.width * rect2.height;

  // 计算重叠占比
  const overlapRatio = overlapArea / totalArea;

  return overlapRatio;
}

export function Timeline() {
  const { timelineState, updateTimelineState } = useTimelineState();
  const { trackList, getSegment, updateSegment, segmentToTrack, updateTrackActive } = useTrackList([
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
  /** 选中片段 */
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
  const $contentBody = useRef<HTMLDivElement>(null);
  const $trackList = useRef<HTMLDivElement>(null);
  // const $drag = useRef<HTMLDivElement>(null);

  function init() {
    const { secondWidth, totalTime } = timelineState
    const contentWidth = secondWidth * totalTime;
    
    updateTimelineState({
      contentWidth,
      scrollWidth: contentWidth + LeftGap + RightHide
    });

    console.log($trackList.current?.children);
  }

  useEffect(() => {
    init();
  }, [])

  /**
   * 通过scrollLeft计算nowTime值
   * @param dire 方向
   */
  function scrollToTime(dire: -1 | 1): number {
    timelineState.scrollLeft = $contentBody.current?.scrollLeft || 0;
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
    dragTarget: string | 'new';
    trackBBox: { id: string; rect: DOMRect }[];
    dragBox: DOMRect;
  } = {
    id: '',
    action: 'drag',
    dragTarget: '',
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
    dragBox: new DOMRect(0, 0),
    trackBBox: []
  }

  function onSelectionDown(e: PointerEvent): void {
    const dataset = (e.target as HTMLDivElement).dataset;
    const action = dataset.action || '';
    const getSegments = getSegment(dataset.id || '');

    if (action === '' || !getSegments || $trackList.current === null) return;
    
    const { segment, prev: prevS, next: nextS } = getSegments;
    const segRect = ((e.target as HTMLDivElement).parentNode as HTMLDivElement).getBoundingClientRect();
    updateSelectSegment({ id: dataset.id || '', drag: '' });
    updateTrackActive(dataset.trackid || '', true);

    sMpos.id = dataset.id || '';
    sMpos.action = action as 'drag' | 'edge-front' | 'edge-rear';
    sMpos.point = [e.clientX, e.clientY - segRect.top]
    sMpos.dragBox = new DOMRect(0, 0, 1550, 22); // TODO: 暂时定死轴的宽高
    sMpos.trackBBox = [...$trackList.current.children].map(el => ({
      id: el.getAttribute('data-id') || '',
      rect: el.getBoundingClientRect()
    }));
    
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
          sMpos.ml = prevS ? prevS.end : 0;
          sMpos.mr = Fix3(segment.end - Math.max(0.1, sMpos.midDur));
        }
        break
      case 'edge-rear':
        {
          console.log(nextS ? nextS.start : -1);
          
          sMpos.eTime = segment.end;
          sMpos.ml = segment.start + Math.max(0.1, sMpos.midDur);
          sMpos.mr = nextS ? nextS.start : -1;
        }
        break
    }

    document.addEventListener('pointermove', onSelectionMove, false);
    document.addEventListener('pointerup', onSelectionUp, false);

  }

  function onSelectionMove(e: PointerEvent) {
    e.preventDefault();

    const { secondWidth, limitLeft, scrollLeft } = timelineState
    const x = e.clientX;
    const time = scrollToTime(-1) + (e.pageX - limitLeft) / secondWidth;
    
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
          const x = (limitLeft - scrollLeft) + (eTime * secondWidth),
          y = e.clientY - sMpos.point[1];
          
          sMpos.dragBox.x = x;
          sMpos.dragBox.y = y;
          for (let i = 0; i < sMpos.trackBBox.length; i++) {
            let overlapRatio = calculateOverlapRatio(sMpos.dragBox, sMpos.trackBBox[i].rect);
            overlapRatio = Math.floor((overlapRatio * 100));
            // 判断元素是否出现重叠
            if (overlapRatio >= 20) {
              sMpos.dragTarget = sMpos.trackBBox[i].id;
              updateTrackActive(sMpos.trackBBox[i].id, true);
            }
          }

          updateSelectSegment({ id: sMpos.id, drag: sMpos.action})
          updateTimelineState({ dragTrackWrap: { active: true, x, y }});
        }
        break;
      case 'edge-front':
        {
          sMpos.start = eTime;
          sMpos.dur = sMpos.end - eTime;
          updateSelectSegment({ 
            id: sMpos.id,
            drag: sMpos.action,
            left: sMpos.start * secondWidth,
            width: sMpos.dur * secondWidth
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
            left: sMpos.start * secondWidth,
            width: dur * secondWidth
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
          segmentToTrack(sMpos.dragTarget, sMpos.id);
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

  /**
   * 双指捏合缩放
   */
  function wheelEvent(e: SyntheticEvent) {
    if ((e as unknown as WheelEvent).ctrlKey) {
      // e.preventDefault();
      console.log('wheelEvent');
      
    //   // let val = secondWidth.value - e.deltaY;
    //   // val = val < 20 ? 20 : val > 340 ? 340 : val;
    //   // secondWidth.value = Math.round(val);
    }
  }

  /**
   * 滚动事件修改自定义滚动块
   * @param e e
   */
  function scrollEvent() {
    // console.log('scrollEvent', ContentBody.current?.scrollLeft);
    updateTimelineState({ scrollLeft: $contentBody.current?.scrollLeft })
    // handleXLeft.value = (scrollLeft.value * visibleWidth.value) / scrollWidth.value;
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

        <div className="timeline-bd" ref={ $contentBody } onScroll={ scrollEvent } onWheel={ wheelEvent }>

          <div className='content-scroll-body' style={{ width: timelineState.scrollWidth }}>

            {/* --------------- 时间轴刻度 ----------- */}
            <TimelineAxios totalTimeInt={timelineState.totalTime} secondWidth={timelineState.secondWidth}/>
            
            {/* --------------- 时间轴轨道容器 ----------- */}
            <div className='track-wrapper' onPointerDown={ (e: SyntheticEvent) => onSelectionDown(e as unknown as PointerEvent) }>

              {/* --------------- 时间轴轨道列表----------- */}
              <div className='track-list' ref={ $trackList }>

                {
                  trackList.map((track, index) => {
                    return (
                      <div 
                        className={ `track type-sticker ${ track.active ? 'selected' : '' }` } 
                        data-index={ index }
                        data-id={ track.id }
                        key={ track.id }>

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
