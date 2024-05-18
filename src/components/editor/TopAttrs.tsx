import './TopAttrs.css';

export function TopAttrs() {
  return (
    <div className="arco-resizebox editor-content-top-attrs" style={{ paddingLeft: '2px'}}>
      <div className="sider-attribute">
        <div className="arco-tabs arco-tabs-horizontal arco-tabs-line arco-tabs-top arco-tabs-size-small sider-attribute-tabs">
          <p>属性面板</p>


        </div>
      </div>
      <div className="arco-resizebox-trigger arco-resizebox-trigger-vertical arco-resizebox-direction-left"><div className="arco-resizebox-trigger-icon-wrapper"><span className="arco-resizebox-trigger-icon-empty"></span><span className="arco-resizebox-trigger-icon"></span><span className="arco-resizebox-trigger-icon-empty"></span></div></div>
    </div>
  )
}