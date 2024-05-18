import { TimelineTools } from "./TimelineTools";
import { Timeline } from "./Timeline";
import './TimelineContainer.css';

export function TimelineContainer() {
  return (
    <div className="timeline-container"  >
      <TimelineTools></TimelineTools>
      <Timeline></Timeline>
    </div>
  )
}