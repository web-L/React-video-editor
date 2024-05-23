import { TimeLineTrack, TimelineSegment } from './type';

interface SegmentProps {
  active: boolean;
  track: TimeLineTrack
  s: TimelineSegment;
  i: number;
  width: number;
  left: number;
}

export const SegmentComponent: React.FC<SegmentProps> = ({ active, s, i, left, width, track}) => (
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