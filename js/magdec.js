// มุมเบี่ยงแม่เหล็ก (Magnetic Declination) ด้วยแบบจำลอง WMM-2025 ของ NOAA (ข้อมูลสาธารณะ ใช้ได้ถึงปลายปี 2029)
// APK หล่อแก มีฟังก์ชันเดียวกัน (MagDeclinationClass) ให้เลือก "ทิศเดิม" (แม่เหล็ก) หรือ "ทิศปรับ" (ทิศเหนือจริง)
// ค่าบวก = เข็มทิศเบนไปทางตะวันออกของทิศเหนือจริง · ทิศจริง = ทิศแม่เหล็ก + มุมเบี่ยง
const WMM = { epoch: 2025, g: [0, -29351.8, -1410.8, -2556.6, 2951.1, 1649.3, 1361, -2404.1, 1243.8, 453.6, 895, 799.5, 55.7, -281.1, 12.1, -233.2, 368.9, 187.2, -138.7, -142, 20.9, 64.4, 63.8, 76.9, -115.7, -40.9, 14.9, -60.7, 79.5, -77, -8.8, 59.3, 15.8, 2.5, -11.1, 14.2, 23.2, 10.8, -17.5, 2, -21.7, 16.9, 15, -16.8, 0.9, 4.6, 7.8, 3, -0.2, -2.5, -13.1, 2.4, 8.6, -8.7, -12.9, -1.3, -6.4, 0.2, 2, -1, -0.6, -0.9, 1.5, 0.9, -2.7, -3.9, 2.9, -1.5, -2.5, 2.4, -0.6, -0.1, -0.6, -0.1, 1.1, -1, -0.2, 2.6, -2, -0.2, 0.3, 1.2, -1.3, 0.6, 0.6, 0.5, -0.1, -0.4, -0.2, -1.3, -0.7], h: [0, 0, 4545.4, 0, -3133.6, -815.1, 0, -56.6, 237.5, -549.5, 0, 278.6, -133.9, 212, -375.6, 0, 45.4, 220.2, -122.9, 43, 106.1, 0, -18.4, 16.8, 48.8, -59.8, 10.9, 72.7, 0, -48.9, -14.4, -1, 23.4, -7.4, -25.1, -2.3, 0, 7.1, -12.6, 11.4, -9.7, 12.7, 0.7, -5.2, 3.9, 0, -24.8, 12.2, 8.3, -3.3, -5.2, 7.2, -0.6, 0.8, 10, 0, 3.3, 0, 2.4, 5.3, -9.1, 0.4, -4.2, -3.8, 0.9, -9.1, 0, 0, 2.9, -0.6, 0.2, 0.5, -0.3, -1.2, -1.7, -2.9, -1.8, -2.3, 0, -1.3, 0.7, 1, -1.4, 0, 0.6, -0.1, 0.8, 0.1, -1, 0.1, 0.2], gd: [0, 12, 9.7, -11.6, -5.2, -8, -1.3, -4.2, 0.4, -15.6, -1.6, -2.4, -6, 5.6, -7, 0.6, 1.4, 0, 0.6, 2.2, 0.9, -0.2, -0.4, 0.9, 1.2, -0.9, 0.3, 0.9, 0, -0.1, -0.1, 0.5, -0.1, -0.8, -0.8, 0.8, -0.1, 0.2, 0, 0.5, -0.1, 0.3, 0.2, 0, 0.2, 0, -0.1, 0.1, 0.3, -0.3, 0, 0.3, -0.1, 0.1, -0.1, 0.1, 0, 0.1, 0.1, 0, -0.3, 0, -0.1, -0.1, 0, 0, 0, 0, 0, 0, 0, -0.1, 0, 0, -0.1, -0.1, -0.1, -0.1, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0, -0.1, 0, -0.1], hd: [0, 0, -21.5, 0, -27.7, -12.1, 0, 4, -0.3, -4.1, 0, -1.1, 4.1, 1.6, -4.4, 0, -0.5, 2.2, 0.4, 1.7, 1.9, 0, 0.3, -1.6, -0.4, 0.9, 0.7, 0.9, 0, 0.6, 0.5, -0.8, 0, -1, 0.6, -0.2, 0, -0.2, 0.5, -0.4, 0.4, -0.5, -0.6, 0.3, 0.2, 0, -0.3, 0.3, -0.3, 0.3, 0.2, -0.1, -0.2, 0.4, 0.1, 0, 0, 0, -0.2, 0.1, -0.1, 0.1, 0, -0.1, 0.2, 0, 0, 0, 0.1, 0, 0.1, 0, 0, 0.1, 0, 0, 0, 0, 0, 0, 0, -0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, -0.1], nmax: 12 };
function magDeclination(lat, lng, date) {
    const t = (date || new Date()).getFullYear() + ((date || new Date()) - new Date((date || new Date()).getFullYear(), 0, 1)) / 31557600000 - WMM.epoch;
    const rad = Math.PI / 180, a = 6378.137, f = 1 / 298.257223563, b = a * (1 - f), re = 6371.2;
    // พิกัดภูมิศาสตร์ → พิกัดศูนย์กลางโลก (ความสูง 0 กม.)
    const phi = lat * rad, lam = lng * rad, sp = Math.sin(phi), cp = Math.cos(phi);
    const e2 = f * (2 - f), rc = a / Math.sqrt(1 - e2 * sp * sp);
    const xp = rc * cp, zp = rc * (1 - e2) * sp, r = Math.hypot(xp, zp), phic = Math.asin(zp / r);
    const st = Math.sin(phic), ct = Math.cos(phic); // st = sin(ละติจูดศูนย์กลาง)
    // ฟังก์ชันเลอฌ็องดร์แบบ Schmidt semi-normalized (ตัวแปร = sin ละติจูดศูนย์กลาง) และอนุพันธ์ตามละติจูด
    const N = WMM.nmax, P = [], dP = [];
    for (let n = 0; n <= N; n++) { P.push(new Array(N + 1).fill(0)); dP.push(new Array(N + 1).fill(0)); }
    P[0][0] = 1; P[1][1] = ct; dP[1][1] = -st;
    for (let n = 2; n <= N; n++) {
        const k = Math.sqrt((2 * n - 1) / (2 * n));
        P[n][n] = k * ct * P[n - 1][n - 1];
        dP[n][n] = k * (ct * dP[n - 1][n - 1] - st * P[n - 1][n - 1]);
    }
    for (let m = 0; m <= N; m++) for (let n = m + 1; n <= N; n++) {
        const k1 = (2 * n - 1) / Math.sqrt(n * n - m * m), k2 = n >= m + 2 ? Math.sqrt(((n - 1) * (n - 1) - m * m) / (n * n - m * m)) : 0;
        P[n][m] = k1 * st * P[n - 1][m] - (k2 ? k2 * P[n - 2][m] : 0);
        dP[n][m] = k1 * (st * dP[n - 1][m] + ct * P[n - 1][m]) - (k2 ? k2 * dP[n - 2][m] : 0);
    }
    let X = 0, Y = 0, Z = 0; // เหนือ ตะวันออก ลง (พิกัดศูนย์กลางโลก)
    for (let n = 1; n <= N; n++) {
        const ar = Math.pow(re / r, n + 2);
        for (let m = 0; m <= n; m++) {
            const i = n * (n + 1) / 2 + m;
            const g = WMM.g[i] + t * WMM.gd[i], h = WMM.h[i] + t * WMM.hd[i];
            const cm = Math.cos(m * lam), sm = Math.sin(m * lam);
            X -= ar * (g * cm + h * sm) * dP[n][m];
            if (ct > 1e-10) Y += ar * m * (g * sm - h * cm) * P[n][m] / ct;
            Z -= ar * (n + 1) * (g * cm + h * sm) * P[n][m];
        }
    }
    // หมุนกลับเป็นพิกัดภูมิศาสตร์ (ต่างกันตามความแบนของโลก)
    const psi = phic - phi, Xg = X * Math.cos(psi) - Z * Math.sin(psi);
    return Math.atan2(Y, Xg) / rad;
}

// ---------- ทิศอ้างอิงที่ผู้ใช้เลือก (ใช้ร่วมทุกหน้า) ----------
// mode: 'mag' = ทิศแม่เหล็ก (ทิศเดิม ตามหล่อแกดั้งเดิม) · 'true' = ทิศเหนือจริง (ทิศปรับ)
// ตำแหน่งเริ่มต้น = กรุงเทพฯ จนกว่าผู้ใช้กด "ใช้ตำแหน่งปัจจุบัน"
const NORTH = { mode: 'mag', lat: 13.7563, lng: 100.5018, place: 'กรุงเทพฯ (ค่าเริ่มต้น)' };
try { Object.assign(NORTH, JSON.parse(localStorage.getItem('luopan_north') || '{}')); } catch (e) {}
function northSave() { try { localStorage.setItem('luopan_north', JSON.stringify(NORTH)); } catch (e) {} }
function northDecl() { return magDeclination(NORTH.lat, NORTH.lng, new Date()); }
// ค่าที่ต้องบวกกับองศาจากเข็มทิศมือถือ (ซึ่งอิงทิศแม่เหล็ก)
function northOffset() { return NORTH.mode === 'true' ? northDecl() : 0; }
// แปลงองศาทิศจริง (เช่น จากแผนที่) เป็นองศาตามทิศอ้างอิงที่เลือก
function trueToRef(deg) { const d = NORTH.mode === 'true' ? deg : deg - northDecl(); return ((d % 360) + 360) % 360; }
function northLocate(done) {
    if (!navigator.geolocation) { done(false, 'เบราว์เซอร์นี้หาตำแหน่งไม่ได้'); return; }
    navigator.geolocation.getCurrentPosition(
        (p) => { NORTH.lat = p.coords.latitude; NORTH.lng = p.coords.longitude; NORTH.place = `${NORTH.lat.toFixed(4)}, ${NORTH.lng.toFixed(4)}`; northSave(); done(true); },
        (e) => done(false, e.code === 1 ? 'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง' : 'หาตำแหน่งไม่สำเร็จ'),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
}
