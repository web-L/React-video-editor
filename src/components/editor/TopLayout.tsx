import { TopAttrs } from "./TopAttrs";
import { TopPlayer } from "./TopPlayer";
import './TopLayout.css'

export function TopLayout() {
  return (
    <>
      <div className="arco-resizebox-split-pane first-pane" style={{ flexBasis: 'calc(70% - 1px)' }}>

        <div className="editor-content-top">

          <TopPlayer></TopPlayer>
          <TopAttrs></TopAttrs>

        </div>

      </div>
    </>
  )
}