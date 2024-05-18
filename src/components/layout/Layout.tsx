import { Header } from '@/components/panel/Header';
import { Material } from '@/components/panel/Material';
import { Editor } from '@/components/editor/index';
import { TimelinesLayout } from '@/components/timelines';
import './Layout.css';

export function Layout() {
  return (
    <>
      <Header></Header>

      <div className="editor-container" id="editor-container">
        <Material></Material>

        <div className='editor-content'>
          <div className='arco-resizebox-split arco-resizebox-split-vertical editor-content-resize-box' style={ { height: '100%' } }>

            <Editor></Editor>

            <div className="arco-resizebox-trigger arco-resizebox-trigger-horizontal arco-resizebox-split-trigger"><div className="arco-resizebox-trigger-icon-wrapper"><span className="arco-resizebox-trigger-icon-empty"></span><span className="arco-resizebox-trigger-icon"></span><span className="arco-resizebox-trigger-icon-empty"></span></div></div>

            <TimelinesLayout></TimelinesLayout>

          </div>
        </div>
      </div>
    </>
  )
}