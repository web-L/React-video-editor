import './Material.css'

export function Material() {
  return (
    <>
      <div className="sider-material" id="sider-material">
        <div className="arco-resizebox sider-material__resizebox">
          <div className='arco-tabs arco-tabs-vertical arco-tabs-line arco-tabs-left arco-tabs-size-default tabs-sider tabs-material'>
            <div className="tab-header">
              <div className="tab-head-main">
                <section className='tab-header__main'>
                  <div className="tab-title-wrapper tab-title-wrapper--active">媒体</div>
                  <div className="tab-title-wrapper">音频</div>
                  <div className="tab-title-wrapper">文本</div>
                  <div className="tab-title-wrapper">贴纸</div>
                  <div className="tab-title-wrapper">特效</div>
                  <div className="tab-title-wrapper">转场</div>
                  <div className="tab-title-wrapper">滤镜</div>
                </section>
              </div>
            </div>
            <div className="arco-tabs-content arco-tabs-content-vertical">
              <div className='arco-tabs-content arco-tabs-content-horizontal'>

                <div className="arco-tabs-header-nav arco-tabs-header-nav-horizontal ">
                  <span className="arco-tabs-header-title-text">项目素材</span>
                </div>

                <div className='arco-tabs-content-item arco-tabs-content-item-active'>

                  <div className='arco-tabs-pane'>

                    <div className='file-bucket'>

                      <div className='card-item-wrapper card-file'>
                        <div className="image-wrapper">
                          <img className="image" src="https://lf3-effectcdn-tos.byteeffecttos.com/obj/ies.fe.effect//22539aef9d49d234c27e66b4a734bf88" draggable="true" />
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>

          <div className="arco-resizebox-trigger arco-resizebox-trigger-vertical arco-resizebox-direction-right"><div className="arco-resizebox-trigger-icon-wrapper"><span className="arco-resizebox-trigger-icon-empty"></span><span className="arco-resizebox-trigger-icon"></span><span className="arco-resizebox-trigger-icon-empty"></span></div></div>
        </div>
      </div>
    </>
  )
}