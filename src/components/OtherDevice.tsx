// NEWEST TAB WINS (2026-10-16): shown on a world page when the kid opened a world page in another tab or on another device.
// Nothing is saved from this tab any more. 'Play here' reloads the page fresh from the cloud (and makes this tab the active one).
// The background never closes it (button only). English only (world page rule).
export default function OtherDevice() {
  return (
    <div className="od-root" role="dialog" aria-modal="true">
      <style>{CSS}</style>
      <div className="od-box">
        <div className="od-word">You are playing on another device</div>
        <button type="button" className="od-btn" onClick={() => window.location.reload()}>Play here</button>
      </div>
    </div>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Titan+One&display=swap');
.od-root{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#1d3f66 0%,#0b1c33 75%);touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;animation:od-in .5s ease-out}
@keyframes od-in{from{opacity:0}to{opacity:1}}
.od-box{display:flex;flex-direction:column;align-items:center;gap:48px;padding:0 24px;text-align:center;max-width:900px}
.od-word{font-family:'Titan One','Fredoka',sans-serif;font-size:clamp(28px,6vw,54px);line-height:1.2;color:#ffd34d;text-shadow:0 3px 0 #b8741a,0 6px 14px rgba(0,0,0,.5)}
.od-btn{font-family:'Titan One','Fredoka',sans-serif;font-size:clamp(28px,5vw,46px);color:#fff;background:linear-gradient(#5fd35f,#2e9e3a);border:4px solid #fff;border-radius:999px;padding:18px 56px;cursor:pointer;box-shadow:0 0 24px rgba(255,211,77,.45),0 6px 0 #1d6b27;text-shadow:0 2px 0 rgba(0,0,0,.35)}
.od-btn:active{transform:translateY(4px);box-shadow:0 0 24px rgba(255,211,77,.45),0 2px 0 #1d6b27}
`;
