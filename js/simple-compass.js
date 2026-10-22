// หล่อแกแบบง่าย (compass.html) สำหรับโหมดผู้ใช้ทั่วไป
// จาน 2 มิติ 8 ทิศ + 24 ภูเขา หมุนตามเครื่อง (ด้านบนจอ = ทิศที่หัวเครื่องชี้) · ระบายสีทิศตามผลบ้าน (js/simple-core.js)
// อ่านเซนเซอร์แบบเดียวกับหน้าเข็มทิศเต็ม (js/compass.js) และบวกมุมเบี่ยงแม่เหล็กตามตัวเลือก (js/magdec.js)

const $ = (id) => document.getElementById(id);
const norm = (d) => ((d % 360) + 360) % 360;
const STATE_FILL = { good: 'rgba(16,185,129,0.30)', bad: 'rgba(244,63,94,0.30)', mid: 'rgba(51,65,85,0.35)' };
const STATE_ICON = { good: '✅', bad: '⚠️', mid: '' };

let target = null, shown = null;           // องศาเป้าหมายจากเซนเซอร์ และองศาที่แสดง (ค่อย ๆ ขยับเข้าหา)
let active = false, gotAbs = false, lastAt = 0, absSensor = null;
let SUM = null, measured = false;   // measured = ได้ค่าจากเซนเซอร์หรือผู้ใช้เลื่อนเองแล้ว
try { if (house) SUM = houseSummary(house.facing, housePeriod(), getExactPillars(new Date()).solarYear, simpleOwnerKua()); } catch (e) { SUM = null; }

// ---------- วาดจาน (ครั้งเดียว แล้วหมุนทั้งกลุ่ม) ----------
const P = (r, b) => { const a = b * Math.PI / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };
function wedge(r0, r1, b0, b1, fill, stroke) {
    const [x0, y0] = P(r1, b0), [x1, y1] = P(r1, b1), [x2, y2] = P(r0, b1), [x3, y3] = P(r0, b0), L = (b1 - b0) > 180 ? 1 : 0;
    return `<path d="M${x0},${y0} A${r1},${r1} 0 ${L} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${L} 0 ${x3},${y3}Z" fill="${fill}" stroke="${stroke || '#334155'}" stroke-width="1"/>`;
}
const txt = (r, b, s, size, fill, weight, cls) => { const [x, y] = P(r, b); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" fill="${fill}" font-weight="${weight || 600}" text-anchor="middle" dominant-baseline="central" transform="rotate(${b} ${x.toFixed(1)} ${y.toFixed(1)})" class="${cls || ''}">${s}</text>`; };
function drawDial() {
    let h = `<circle r="198" fill="#0b1220" stroke="#a16207" stroke-width="3"/>`;
    // วงนอก 24 ภูเขา (壬 ตรงกลางที่ 345°)
    const fm = house ? houseMountainOf(house.facing).m : -1;
    for (let i = 0; i < 24; i++) {
        const c = i * 15 - 15;
        h += wedge(150, 196, c - 7.5, c + 7.5, i === fm ? 'rgba(239,68,68,0.35)' : 'transparent', '#475569');
        h += txt(181, c, HOUSE_M24[i], 17, '#f8fafc', 700, 'cn');
        h += txt(161, c, HOUSE_M24_TH[i], 9.5, '#94a3b8', 500);
    }
    // วงใน 8 ทิศ ระบายสีตามผลบ้าน
    for (let p = 0; p < 8; p++) {
        const c = p * 45, x = SUM ? SUM.pals[p] : null, st = x ? simplePalState(x) : 'mid';
        h += wedge(62, 148, c - 22.5, c + 22.5, STATE_FILL[st], '#475569');
        h += txt(130, c, HOUSE_PALACE_SHORT[p], 15, '#ffffff', 700);
        h += txt(112, c, HOUSE_PALACES[p] + ' · ' + SIMPLE_TRIGRAM[p], 10, '#cbd5e1', 500, 'cn');
        if (x) h += txt(88, c, `${STATE_ICON[st]} ${simplePalLabel(x, st)}`, 11, st === 'good' ? '#a7f3d0' : st === 'bad' ? '#fecdd3' : '#cbd5e1', 600);
    }
    h += `<circle r="60" fill="#0f172a" stroke="#475569"/>`;
    if (house) { const [fx, fy] = P(203, norm(house.facing)); h += `<circle cx="${fx}" cy="${fy}" r="5" fill="#ef4444"/>`; }
    $('dial').innerHTML = `<g id="rot">${h}</g><text x="0" y="-8" font-size="13" fill="#facc15" font-weight="700" text-anchor="middle">${house ? 'บ้านของคุณ' : 'หล่อแก'}</text><text x="0" y="12" font-size="10" fill="#94a3b8" text-anchor="middle">${house ? 'สีตามผลบ้าน' : 'ยังไม่ได้บันทึกบ้าน'}</text>`;
}

// ---------- แสดงค่า ----------
function render(d) {
    $('rot').setAttribute('transform', `rotate(${(-d).toFixed(2)})`);
    const mo = houseMountainOf(d);
    $('deg').textContent = d.toFixed(1) + '°';
    $('dirTxt').textContent = 'ทิศ' + HOUSE_PALACE_TH[mo.palace];
    $('mtTxt').innerHTML = `ภูเขา <span class="cn text-white">${HOUSE_M24[mo.m]}</span> ${HOUSE_M24_TH[mo.m]}${NORTH.mode === 'true' ? ' · อิงทิศเหนือจริง' : ''}`;
    const ln = houseDownLine(d), w = $('warnTxt');
    if (ln) { w.className = 'text-[13px] mt-2 text-rose-300'; w.textContent = `⚠️ ตกเส้นอันตราย (${ln.th}) ขยับตำแหน่งแล้ววัดใหม่`; }
    else if (mo.dist <= 1.5) { w.className = 'text-[13px] mt-2 text-amber-300'; w.textContent = '⚠️ ใกล้เส้นแบ่งภูเขา ควรวัดซ้ำอีก 1–2 จุด'; }
    else w.className = 'hidden';
    const pt = $('palTxt');
    if (SUM) {
        const x = SUM.pals[mo.palace], st = simplePalState(x);
        pt.className = 'text-[14px] mt-2 ' + (st === 'good' ? 'text-emerald-300' : st === 'bad' ? 'text-rose-300' : 'text-slate-300');
        pt.innerHTML = `ทิศนี้ในบ้านคุณ: <b>${STATE_ICON[st]} ${simplePalLabel(x, st)}</b>${x.good && st === 'good' ? ` · เหมาะเป็น${x.good.useShort}` : ''}`;
    }
}
function loop() {
    if (target !== null) {
        if (shown === null) shown = target;
        const diff = ((target - shown + 540) % 360) - 180;
        if (Math.abs(diff) > 0.05) { shown = norm(shown + diff * 0.18); render(shown); }
    }
    requestAnimationFrame(loop);
}

// ---------- เซนเซอร์ ----------
const screenAngle = () => (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (typeof window.orientation === 'number' ? window.orientation : 0);
function setHeading(hd) { target = norm(hd + screenAngle() + northOffset()); lastAt = Date.now(); measured = true; }
function onOrient(e) {
    if (!active) return;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) return setHeading(e.webkitCompassHeading);
    if (e.type === 'deviceorientationabsolute') { if (e.alpha == null) return; gotAbs = true; return setHeading(360 - e.alpha); }
    if (e.absolute === true && !gotAbs && e.alpha != null) setHeading(360 - e.alpha);
}
async function startAbs() {
    if (!('AbsoluteOrientationSensor' in window)) return;
    try {
        absSensor = new AbsoluteOrientationSensor({ frequency: 30, referenceFrame: 'device' });
        absSensor.addEventListener('reading', () => {
            if (!active || gotAbs || !absSensor.quaternion) return;
            const [x, y, z, w] = absSensor.quaternion;
            const east = 2 * (x * y - z * w), north = 1 - 2 * (x * x + z * z);
            if (Math.hypot(east, north) < 0.2) return;
            setHeading(Math.atan2(east, north) * 180 / Math.PI);
        });
        absSensor.addEventListener('error', () => { absSensor = null; });
        absSensor.start();
    } catch (e) { absSensor = null; }
}
async function start() {
    if (active) return stop();
    if (window.isSecureContext === false || typeof DeviceOrientationEvent === 'undefined') { $('msg').textContent = 'เครื่องนี้ใช้เซนเซอร์เข็มทิศไม่ได้ ใช้ "ใส่องศาเอง" ด้านล่างแทน'; return; }
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try { if (await DeviceOrientationEvent.requestPermission() !== 'granted') { $('msg').textContent = 'ต้องอนุญาตให้เข้าถึงเข็มทิศก่อน'; return; } } catch (e) {}
    }
    active = true; gotAbs = false;
    window.addEventListener('deviceorientationabsolute', onOrient);
    window.addEventListener('deviceorientation', onOrient);
    startAbs();
    $('startBtn').textContent = '■ หยุดเข็มทิศ'; $('startBtn').style.background = '#dc2626';
    $('msg').textContent = 'ถือเครื่องแนวราบ รอตัวเลขนิ่ง';
    const t0 = Date.now();
    setTimeout(() => { if (active && lastAt < t0) $('msg').textContent = 'ยังไม่ได้ค่าทิศจากเครื่อง ลองหมุนเครื่องเป็นเลข 8 หรือใช้ "ใส่องศาเอง"'; }, 3000);
}
function stop() {
    active = false;
    window.removeEventListener('deviceorientationabsolute', onOrient);
    window.removeEventListener('deviceorientation', onOrient);
    if (absSensor) { try { absSensor.stop(); } catch (e) {} absSensor = null; }
    $('startBtn').textContent = '▶ เริ่มเข็มทิศ'; $('startBtn').style.background = '#4f46e5';
}

// ---------- บันทึกเป็นทิศหน้าบ้าน ----------
$('saveBtn').addEventListener('click', () => {
    const d = shown !== null ? shown : target;
    if (d === null || !measured) { $('msg').textContent = 'ยังไม่มีค่าทิศ กด "เริ่มเข็มทิศ" หรือใส่องศาเองก่อน'; return; }
    const facing = Math.round(norm(d) * 10) / 10;
    const hadYear = !!(house && house.year);
    house = { facing, year: hadYear ? house.year : new Date().getFullYear(), period: house && house.period ? house.period : 'auto', savedAt: Date.now() };
    houseSave();
    stop();
    try { SUM = houseSummary(house.facing, housePeriod(), getExactPillars(new Date()).solarYear, simpleOwnerKua()); } catch (e) {}
    drawDial(); render(facing); shown = target = facing;
    const ln = houseDownLine(facing);
    $('msg').innerHTML = `✔ บันทึกทิศหน้าบ้าน ${facing.toFixed(1)}° แล้ว${ln ? ` <span class="text-rose-300">(ตกเส้นอันตราย ควรวัดซ้ำ)</span>` : ''}<br>` +
        (hadYear ? '<a href="home.html" class="text-sky-300 underline">ดูผลบ้านของฉัน →</a>' : '<a href="home.html#setup" class="text-sky-300 underline">ใส่ปีที่สร้างบ้าน แล้วดูผล →</a>');
});
$('startBtn').addEventListener('click', start);
$('manual').addEventListener('input', () => { if (active) stop(); target = +$('manual').value; measured = true; });

drawDial();
target = house ? house.facing : 0; shown = target; render(shown);
$('manual').value = shown;
requestAnimationFrame(loop);
