import './Header.css'
import logo from '@/assets/react.svg';

export function Header() {
  return (
    <header className="arco-layout-header top-nav">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
      <input type="text" className="arco-input arco-input-size-default draft-input" value="未命名草稿" />
      <div className="right"></div>
    </header>
  )
}