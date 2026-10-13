// LOCK message (launch step 4, Andy 2026-10-13): 'Grow your animal N more time(s) / to unlock me!' with the number in bright blue.
export const LockMsg = ({ left, nColor = "#1a7fff" }: { left: number; nColor?: string }) => (
  <>
    <div>Grow your animal <span style={{ color: nColor, fontSize: "1.25em" }}>{left}</span> more time{left === 1 ? "" : "s"}</div>
    <div>to unlock me!</div>
  </>
);
export default LockMsg;
