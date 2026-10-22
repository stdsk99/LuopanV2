// อ่านทิศจากเซนเซอร์มือถือ (ใช้ร่วมได้ทุกหน้า) · ต้องโหลด js/magdec.js ก่อน (northOffset)
// headingStart(onDeg, onMsg) เริ่มฟังค่า → onDeg(องศา 0–360 ที่หัวเครื่องชี้) · headingStop() หยุด · headingActive() สถานะ
// รองรับ iPhone (webkitCompassHeading), Android (deviceorientationabsolute / AbsoluteOrientationSensor)
const HEADING = { on: false, gotAbs: false, sensor: null, last: 0, cb: null };
function headingScreenAngle() { return (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (typeof window.orientation === 'number' ? window.orientation : 0); }
function headingEmit(hd) { HEADING.last = Date.now(); if (HEADING.cb) HEADING.cb((((hd + headingScreenAngle() + northOffset()) % 360) + 360) % 360); }
function headingOnEvent(e) {
    if (!HEADING.on) return;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) return headingEmit(e.webkitCompassHeading);
    if (e.type === 'deviceorientationabsolute') { if (e.alpha == null) return; HEADING.gotAbs = true; return headingEmit(360 - e.alpha); }
    if (e.absolute === true && !HEADING.gotAbs && e.alpha != null) headingEmit(360 - e.alpha);
}
async function headingStart(onDeg, onMsg) {
    const msg = onMsg || (() => {});
    if (window.isSecureContext === false || typeof DeviceOrientationEvent === 'undefined') { msg('เครื่องนี้ใช้เข็มทิศไม่ได้'); return false; }
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try { if (await DeviceOrientationEvent.requestPermission() !== 'granted') { msg('ต้องอนุญาตให้เข้าถึงเข็มทิศก่อน'); return false; } } catch (e) {}
    }
    HEADING.on = true; HEADING.gotAbs = false; HEADING.cb = onDeg;
    window.addEventListener('deviceorientationabsolute', headingOnEvent);
    window.addEventListener('deviceorientation', headingOnEvent);
    if ('AbsoluteOrientationSensor' in window) {
        try {
            const s = new AbsoluteOrientationSensor({ frequency: 30, referenceFrame: 'device' });
            s.addEventListener('reading', () => {
                if (!HEADING.on || HEADING.gotAbs || !s.quaternion) return;
                const [x, y, z, w] = s.quaternion, ea = 2 * (x * y - z * w), no = 1 - 2 * (x * x + z * z);
                if (Math.hypot(ea, no) < 0.2) return;
                headingEmit(Math.atan2(ea, no) * 180 / Math.PI);
            });
            s.addEventListener('error', () => { HEADING.sensor = null; });
            s.start(); HEADING.sensor = s;
        } catch (e) { HEADING.sensor = null; }
    }
    const t0 = Date.now();
    setTimeout(() => { if (HEADING.on && HEADING.last < t0) msg('ยังไม่ได้ค่าทิศจากเครื่อง ลองหมุนเครื่องเป็นเลข 8'); }, 3000);
    return true;
}
function headingStop() {
    HEADING.on = false; HEADING.cb = null;
    window.removeEventListener('deviceorientationabsolute', headingOnEvent);
    window.removeEventListener('deviceorientation', headingOnEvent);
    if (HEADING.sensor) { try { HEADING.sensor.stop(); } catch (e) {} HEADING.sensor = null; }
}
const headingActive = () => HEADING.on;
