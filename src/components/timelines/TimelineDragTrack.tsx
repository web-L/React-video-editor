import ReactDOM from "react-dom";

export const TimelineDragTrackComponent: React.FC<{
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
