// วัดทิศจากเงาแดด (sun.html): มือถือวางราบ ขอบบนชี้ออกนอกบ้าน ปากกาตั้งดิ่งกลางจอ ลากจุดไปที่ปลายเงา
// ทิศของเงา (ทิศจริง) = มุมอซิมุทดวงอาทิตย์ + 180° → ทิศที่ขอบบนเครื่องชี้ = ทิศเงา − มุมของเงาบนจอ
const $ = (id) => document.getElementById(id);
const cv = $('dial'), ctx = cv.getContext('2d');
let size = 400, tip = null, dragging = false, fixed = null; // fixed = ผลที่ล็อกเมื่อปล่อยนิ้ว
const norm = (d) => ((d % 360) + 360) % 360;
const fmt = (d) => ((Math.round(d * 10) / 10) % 360).toFixed(1);

function layout() {
    const w = Math.min(cv.parentElement.clientWidth - 24, 520), dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    size = Math.max(260, w); cv.style.width = size + 'px'; cv.style.height = size + 'px';
    cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function sunNow(t) { return sunPosition(t || new Date(), NORTH.lat, NORTH.lng); }
function draw() {
    layout();
    const c = size / 2, R = size * 0.46;
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
    // ขีดองศาทุก 5° (0° = ขอบบนของเครื่อง)
    for (let a = 0; a < 360; a += 5) {
        const r1 = a % 30 === 0 ? R * 0.86 : a % 15 === 0 ? R * 0.9 : R * 0.94, s = Math.sin(a * Math.PI / 180), k = -Math.cos(a * Math.PI / 180);
        ctx.beginPath(); ctx.moveTo(c + s * r1, c + k * r1); ctx.lineTo(c + s * R, c + k * R); ctx.strokeStyle = '#475569'; ctx.lineWidth = a % 30 === 0 ? 2 : 1; ctx.stroke();
        if (a % 30 === 0) { ctx.fillStyle = '#334155'; ctx.font = `600 ${Math.round(size * 0.032)}px Prompt, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a, c + s * R * 0.78, c + k * R * 0.78); }
    }
    // ลูกศร "ขอบบนเครื่อง = ออกนอกบ้าน"
    ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(c, c - R - 2); ctx.lineTo(c - 10, c - R + 16); ctx.lineTo(c + 10, c - R + 16); ctx.fill();
    ctx.fillStyle = '#dc2626'; ctx.font = `700 ${Math.round(size * 0.034)}px Prompt, sans-serif`; ctx.textAlign = 'center'; ctx.fillText('ออกนอกบ้าน', c, c - R * 0.62);
    // ทิศที่เงาควรตก ถ้าหันเครื่องตรงทิศหน้าบ้านที่บันทึกไว้ (ช่วยตรวจทาน)
    const sp = sunNow();
    if (house && sp.alt > 0) {
        const facingTrue = NORTH.mode === 'true' ? house.facing : house.facing + northDecl();
        const exp = norm(sp.az + 180 - facingTrue) * Math.PI / 180;
        ctx.setLineDash([5, 5]); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.sin(exp) * R * 0.95, c - Math.cos(exp) * R * 0.95); ctx.stroke(); ctx.setLineDash([]);
    }
    // เงา (เส้นจากกลางถึงจุดที่ลาก)
    if (tip) {
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(tip[0] * size, tip[1] * size); ctx.stroke();
    }
    // กากบาทกลาง (ตำแหน่งตั้งปากกา)
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(c - 14, c); ctx.lineTo(c + 14, c); ctx.moveTo(c, c - 14); ctx.lineTo(c, c + 14); ctx.stroke();
    // จุดลาก
    const tp = tip || [0.5, 0.5 + 0.3];
    ctx.beginPath(); ctx.arc(tp[0] * size, tp[1] * size, 14, 0, Math.PI * 2); ctx.fillStyle = '#facc15'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0f172a'; ctx.stroke();
}
function shadowAngle() { const t = tip || [0.5, 0.8]; return norm(Math.atan2(t[0] - 0.5, -(t[1] - 0.5)) * 180 / Math.PI); }
function compute() {
    const t = new Date(), sp = sunNow(t), phi = shadowAngle();
    const trueFacing = norm(sp.az + 180 - phi), dec = northDecl();
    const ref = NORTH.mode === 'true' ? trueFacing : norm(trueFacing - dec);
    return { t, sp, phi, trueFacing, ref, dec };
}
function renderInfo() {
    const sp = sunNow(), h = $('hint');
    $('sunInfo').innerHTML = `ดวงอาทิตย์: อซิมุท <b>${sp.az.toFixed(1)}°</b> · มุมเงย <b>${sp.alt.toFixed(1)}°</b> · ตำแหน่ง ${NORTH.place}`;
    let msg = tip ? (dragging ? 'ลากให้ตรงปลายเงา แล้วปล่อยนิ้ว' : 'ได้ผลแล้ว ถ้าเงาขยับ ลากใหม่ได้') : 'ตั้งปากกาบนกากบาท แล้วลากจุดสีเหลืองไปที่ปลายเงา', warn = false;
    if (sp.alt <= 3) { msg = 'ดวงอาทิตย์ยังไม่ขึ้นหรือตกแล้ว วัดจากเงาแดดไม่ได้'; warn = true; }
    else if (sp.alt < 12) { msg = 'แดดอ่อนมาก เงายาวและจาง วัดได้แต่ควรระวัง · ' + msg; warn = true; }
    else if (sp.alt > 72) { msg = 'ดวงอาทิตย์สูงเกือบตรงหัว เงาสั้นมาก ผลคลาดเคลื่อนง่าย ควรวัดช่วงเช้าหรือบ่าย'; warn = true; }
    h.textContent = msg;
    h.className = 'text-[12px] rounded-lg px-3 py-2 mb-2 border ' + (warn ? 'text-amber-200 bg-amber-950/40 border-amber-800/60' : 'text-sky-200 bg-sky-950/40 border-sky-800/60');
}
function renderResult() {
    const box = $('result');
    if (!fixed) { box.innerHTML = '<div class="text-slate-400">ยังไม่ได้วัด · ลากจุดสีเหลืองไปที่ปลายเงา' + (house ? '<br><span class="text-[11px]">เส้นประสีเทา = ทิศที่เงาควรตก ถ้าหน้าบ้านตรงกับค่าที่บันทึกไว้ ' + house.facing.toFixed(1) + '°</span>' : '') + '</div>'; return; }
    const r = fixed, mt = houseMountainOf(r.ref), sm = houseMountainOf(r.ref + 180), ln = houseDownLine(r.ref);
    const diff = house ? ((r.ref - house.facing + 540) % 360) - 180 : null;
    box.innerHTML = `
        <div class="text-[12px] text-slate-400">ทิศหน้าบ้าน (ขอบบนเครื่อง)</div>
        <div class="text-3xl font-black text-yellow-400 font-mono">${fmt(r.ref)}°</div>
        <div class="text-[12px] text-slate-300">หัน <b class="cn text-yellow-300">${HOUSE_M24[mt.m]}</b> ${HOUSE_M24_TH[mt.m]} · นั่ง <b class="cn text-sky-300">${HOUSE_M24[sm.m]}</b> · ${HOUSE_PALACE_TH[mt.palace]}</div>
        <div class="text-[11px] text-slate-400 mt-1">เวลา ${r.t.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} · ดวงอาทิตย์ ${r.sp.az.toFixed(1)}° สูง ${r.sp.alt.toFixed(1)}° · เงาบนจอ ${r.phi.toFixed(1)}° · ทิศจริง ${fmt(r.trueFacing)}° · ใช้${NORTH.mode === 'true' ? 'ทิศเหนือจริง' : `ทิศแม่เหล็ก (มุมเบี่ยง ${r.dec.toFixed(2)}°)`}</div>
        ${ln ? `<div class="mt-2 text-[12px] text-amber-300">⚠️ ตก${ln.th} (${ln.cn}) ${ln.a}°–${ln.b}°: ${ln.t}</div>` : ''}
        ${diff !== null ? `<div class="mt-2 text-[12px] ${Math.abs(diff) <= 3 ? 'text-emerald-300' : 'text-amber-300'}">เทียบกับทิศที่บันทึกไว้ ${house.facing.toFixed(1)}°: ต่างกัน ${Math.abs(diff) < 0.05 ? '0.0' : (diff > 0 ? '+' : '') + diff.toFixed(1)}°${Math.abs(diff) <= 3 ? ' (ใกล้เคียง)' : ''}</div>` : ''}
        <div class="grid grid-cols-2 gap-2 mt-3">
            <label class="text-[11px] text-slate-400">ปีที่สร้าง/รีโนเวท<input id="yIn" type="number" min="1864" max="2163" value="${house ? house.year : new Date().getFullYear()}" class="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"></label>
            <div class="flex items-end"><button type="button" id="saveBtn" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-[13px] font-semibold">💾 บันทึกเป็นทิศหน้าบ้าน</button></div>
        </div>
        <div id="saved" class="mt-2 text-[12px]"></div>`;
    $('saveBtn').addEventListener('click', () => {
        const y = parseInt($('yIn').value, 10);
        house = { facing: (Math.round(r.ref * 10) / 10) % 360, year: (y >= 1864 && y <= 2163) ? y : new Date().getFullYear(), period: house ? house.period : 'auto', savedAt: Date.now(), source: 'sun' };
        houseSave();
        $('saved').innerHTML = `<span class="text-emerald-300">✔ บันทึกทิศหน้าบ้าน ${house.facing.toFixed(1)}° แล้ว</span> · <a href="plan.html" class="text-sky-300 underline">วิเคราะห์บ้าน</a> · <a href="index.html" class="text-sky-300 underline">เข็มทิศ</a>`;
    });
}
// ---------- ลากจุด ----------
const ptr = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
cv.addEventListener('pointerdown', (e) => { dragging = true; cv.setPointerCapture(e.pointerId); tip = ptr(e); draw(); renderInfo(); });
cv.addEventListener('pointermove', (e) => { if (!dragging) return; tip = ptr(e); draw(); });
const up = () => {
    if (!dragging) return; dragging = false;
    if (tip && Math.hypot(tip[0] - 0.5, tip[1] - 0.5) < 0.04) { tip = null; fixed = null; } // แตะใกล้กลางเกินไป
    else fixed = compute();
    draw(); renderInfo(); renderResult();
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
$('resetBtn').addEventListener('click', () => { tip = null; fixed = null; draw(); renderInfo(); renderResult(); });
$('locBtn').addEventListener('click', () => { $('locBtn').textContent = 'กำลังหาตำแหน่ง…'; northLocate((ok, msg) => { $('locBtn').textContent = '📍 ใช้ตำแหน่งปัจจุบัน'; if (!ok) { $('hint').textContent = msg; return; } if (fixed) fixed = compute(); draw(); renderInfo(); renderResult(); }); });
window.addEventListener('resize', draw);
setInterval(() => { renderInfo(); if (!tip) draw(); }, 30000); // ดวงอาทิตย์เคลื่อนราว 0.25° ต่อนาที
draw(); renderInfo(); renderResult();
