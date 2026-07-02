import MobileV2 from './MobileV2';
import './mobile.css';

export default function Page() {
  return (
    <>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 15% 40%,rgba(13,32,53,.94),#030609 55%)',zIndex:-1}}></div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div className="phone">
          <div className="phone-screen">
            <div className="dyn-island"></div>
            <div className="scr" id="root-scroll">
              <MobileV2 />
            </div>
            <div className="home-bar"></div>
          </div>
        </div>
        <div className="dev-lbl">Sierra Estates · iPhone 16 Pro · 393×852</div>
      </div>
    </>
  );
}
