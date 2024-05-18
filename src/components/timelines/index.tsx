import { TimelineContainer } from './TimelineContainer';

export function TimelinesLayout() {
  return (
    <div className="arco-resize box-split-pane second-pane">
      <div className="editor-content">

        <TimelineContainer></TimelineContainer>

      </div>
    </div>
  )
}