// ดาวเหินของบ้านในหน้าเข็มทิศ: วาดบนจาน กล่องคำแนะนำ แผงผัง 9 ช่อง และฟอร์มตั้งค่าบ้าน
// สูตรอยู่ใน js/fs-core.js

// ---------- สถานะในหน้านี้ ----------
let houseMeasuring = false;  // กำลังวัดทิศบ้านใหม่ด้วยเข็มทิศ
function houseCurrentChart() {
    if (!house) return null;
    // ดาวรุ่ง/ถอย เทียบยุคปัจจุบันตามวันที่ที่เลือก (เหมือน APK F04)
    return houseChart(house.facing, housePeriod(), state.calc.stars.center, state.calc.timeBazi ? houseCurrentPeriod(state.calc.timeBazi.solarYear) : undefined);
}

// ---------- จานในโหมดดาวเหินของบ้าน ----------
// เรียกจาก draw2DTexture() ใน luopan3d.js; g = ค่ารัศมีและฟังก์ชันวาดของจาน
function drawHouseDial(g) {
    const { rTicks, rBrn, rTai, drawSeg, drawTxt, baseFontSize, baseBgColor } = g;
    const ringColor = 'rgba(212,175,55,0.4)';
    ctx.beginPath(); ctx.arc(0, 0, rTicks, 0, 2 * Math.PI); ctx.fillStyle = baseBgColor; ctx.fill();
    const ch = houseCurrentChart();
    // ตัวเลขดาวตั้งตรงเมื่อจานหมุนไปที่องศาปัจจุบัน
    const upright = (state.currentDegree || 0) * Math.PI / 180;

    // วง 24 ภูเขา + ไฮไลต์ภูเขาหน้า/หลังบ้าน
    for (let i = 0; i < 24; i++) {
        const deg = i * 15 - 15;  // i=0 คือ 壬 ที่ 345°
        drawSeg(rBrn, rTicks, deg - 7.5, deg + 7.5, 'transparent', ringColor, 2);
        drawTxt(HOUSE_M24[i], rBrn + (rTicks - rBrn) * 0.68, deg, '#ffffff', `bold ${baseFontSize * 0.95}px serif`, 'transparent');
        drawTxt(HOUSE_M24_TH[i], rBrn + (rTicks - rBrn) * 0.3, deg, '#cbd5e1', `500 ${baseFontSize * 0.5}px Prompt`, 'transparent');
    }
    if (ch) {
        const fd = ch.f.m * 15 - 15, sd = ch.s.m * 15 - 15;
        drawSeg(rBrn, rTicks, fd - 7.5, fd + 7.5, 'rgba(239,68,68,0.25)', '#ef4444', 6);
        drawSeg(rBrn, rTicks, sd - 7.5, sd + 7.5, 'rgba(59,130,246,0.25)', '#3b82f6', 6);
    }

    // 8 วัง
    for (let p = 0; p < 8; p++) {
        const mid = p * 45;
        if (ch) {
            const isWang = ch.mt.g[p] === ch.C || ch.ft.g[p] === ch.C;
            if (ch.an.g[p] === 5) drawSeg(rTai, rBrn, mid - 22.5, mid + 22.5, 'rgba(250,204,21,0.12)', 'transparent');
            else if (isWang) drawSeg(rTai, rBrn, mid - 22.5, mid + 22.5, 'rgba(74,222,128,0.13)', 'transparent');
        }
        drawSeg(rTai, rBrn, mid - 22.5, mid + 22.5, 'transparent', 'rgba(239,68,68,0.6)', 3);
        drawTxt(HOUSE_PALACES[p] + ' ' + HOUSE_PALACE_SHORT[p], rBrn * 0.9, mid, '#cbd5e1', `600 ${baseFontSize * 0.5}px Prompt`, 'transparent');
        if (!ch) continue;
        houseStarBox(rBrn * 0.58, mid, upright, ch.mt.g[p], ch.ft.g[p], ch.base.g[p], ch.an.g[p], ch.C, baseFontSize * 1.35);
    }
    drawSeg(rBrn * 0.99, rBrn, 0, 360, 'transparent', ringColor, 2);

    if (!ch) {
        ctx.save(); ctx.rotate(upright); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fde047'; ctx.font = `600 ${baseFontSize * 0.75}px Prompt`;
        ctx.fillText('ยังไม่ได้บันทึกทิศบ้าน', 0, -rBrn * 0.45);
        ctx.fillStyle = '#cbd5e1'; ctx.font = `500 ${baseFontSize * 0.55}px Prompt`;
        ctx.fillText('หันเข็มทิศออกหน้าบ้าน แล้วกด "บันทึกทิศบ้าน"', 0, -rBrn * 0.33);
        ctx.restore();
    }

    // กลางบ้าน (แทนรูปหยินหยาง)
    ctx.beginPath(); ctx.arc(0, 0, rTai * 1.35, 0, 2 * Math.PI); ctx.fillStyle = '#0f172a'; ctx.fill();
    ctx.strokeStyle = ringColor; ctx.lineWidth = 2; ctx.stroke();
    if (ch) houseStarBox(0, 0, upright, ch.mt.c, ch.ft.c, ch.base.c, ch.an.c, ch.C, baseFontSize * 1.0, true);
}
// กล่องตัวเลขดาว: ภูเขา (เหลือง) · น้ำ (ฟ้า) · ยุค (เทา) · จรปี (ป้ายเหลือง)
function houseStarBox(r, deg, upright, m, f, b, a, P, fs, plain) {
    const t = (deg - 90) * Math.PI / 180;
    ctx.save();
    ctx.translate(Math.cos(t) * r, Math.sin(t) * r);
    ctx.rotate(upright);
    const w = fs * 3.4, h = fs * 2.3;
    if (!plain) { ctx.fillStyle = 'rgba(2,6,23,0.78)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, fs * 0.35); else ctx.rect(-w / 2, -h / 2, w, h); ctx.fill(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${fs * 1.05}px Arial`;
    ctx.fillStyle = '#fbbf24'; ctx.fillText(m, -w * 0.25, -h * 0.17);
    ctx.fillStyle = '#60a5fa'; ctx.fillText(f, w * 0.25, -h * 0.17);
    ctx.fillStyle = '#94a3b8'; ctx.font = `700 ${fs * 0.75}px Arial`; ctx.fillText(b, 0, h * 0.28);
    // ดาวจรปี
    const bw = fs * 0.62;
    ctx.fillStyle = a === 5 ? '#f87171' : '#fbbf24';
    ctx.fillRect(w * 0.25 - bw / 2, h * 0.28 - bw / 2, bw, bw);
    ctx.fillStyle = '#0f172a'; ctx.font = `900 ${fs * 0.5}px Arial`; ctx.fillText(a, w * 0.25, h * 0.29);
    // กรอบเขียว = ดาวรุ่งของยุค
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = Math.max(2, fs * 0.08);
    if (m === P) ctx.strokeRect(-w * 0.25 - fs * 0.42, -h * 0.17 - fs * 0.58, fs * 0.84, fs * 1.1);
    if (f === P) ctx.strokeRect(w * 0.25 - fs * 0.42, -h * 0.17 - fs * 0.58, fs * 0.84, fs * 1.1);
    ctx.restore();
}

// ---------- คำแนะนำของทิศที่ชี้อยู่ (ใช้ใน updateAdviceBox) ----------
function houseAdvice(deg) {
    const ch = houseCurrentChart();
    if (!ch) return { title: 'ยังไม่ได้บันทึกทิศบ้าน', remedy: 'หันเข็มทิศออกหน้าบ้าน แล้วกดปุ่ม "บันทึกทิศบ้าน" ด้านล่าง', level: 'normal' };
    const p = Math.floor(norm360(deg + 22.5) / 45) % 8;
    const m = ch.mt.g[p], f = ch.ft.g[p], b = ch.base.g[p], a = ch.an.g[p], P = ch.C;
    const notes = []; let level = 'normal';
    const good = (n) => ['wang', 'sheng'].includes(houseTimeliness(n, P).k);
    // ข้อความสั้น กระชับ ให้พอดีกล่องเหนือกล่ององศาบนมือถือ
    if (m === P && f === P) { notes.push('ดาวรุ่งคู่ ดีมาก'); level = 'good'; }
    else if (f === P) { notes.push('ดาวน้ำรุ่ง เหมาะประตู/ทางเดิน'); level = 'good'; }
    else if (m === P) { notes.push('ดาวภูเขารุ่ง เหมาะห้องนอน'); level = 'good'; }
    else if (good(m) || good(f)) level = 'good';
    const five = m === 5 || f === 5;
    if (five) level = 'bad';
    if ([m, f].includes(2) && !good(2) && level !== 'bad') level = level === 'good' ? 'normal' : 'bad';
    if (a === 5) { notes.push('ปีนี้ 五黃 จร ห้ามเคาะเจาะทุบ'); level = 'fatal'; }
    else if (a === 2) { notes.push('ปีนี้ 二黑 จร ระวังป่วย'); if (level !== 'fatal') level = 'bad'; }
    // คู่ดาวภูเขา+น้ำ (js/fs-pairs.js) ตัดชื่อจีนในวงเล็บออก
    const pr = fsPair(m, f), pg = (good(m) || good(f)) && !five && !/ไม่มีด้านดี/.test(pr.g);
    notes.push(`${pr.t.replace(/\s*\(.*\)/, '')}: ${pg ? pr.g : pr.b}`);
    notes.push(`แก้: ${pr.r}`);
    // กลุ่มดาวพิเศษที่ร้ายที่สุด 1 ชุด
    const tb = state.calc.timeBazi;
    const mo = tb ? houseFly(houseMonthStar(tb.year, tb.month), true).g[p] : 0;
    const gp = fsGroups({ b, f, m, a, mo }).sort((x, y) => (x.k === 'bad' ? 0 : 1) - (y.k === 'bad' ? 0 : 1))[0];
    if (gp) { notes.push(`${gp.k === 'good' ? '✦' : '⚠'} ${gp.t}`); if (gp.k === 'bad' && level === 'good') level = 'normal'; }
    return {
        title: `${HOUSE_PALACE_SHORT[p]} · ภูเขา ${m} น้ำ ${f} · จรปี ${a}`,
        remedy: notes.join(' · '),
        level
    };
}

// ---------- แผงผัง 9 ช่องในแท็บวิเคราะห์ ----------
function renderHousePanel() {
    const el = document.getElementById('housePanel');
    if (!el) return;
    const ch = houseCurrentChart();
    if (!ch) {
        el.innerHTML = '<div class="text-slate-400 text-[11px] text-center py-3">ยังไม่ได้บันทึกทิศบ้าน<br>ไปที่แท็บ ตั้งค่า → ทิศบ้าน (ดาวเหิน)</div>';
        return;
    }
    // วางผังให้ทิศหน้าบ้านอยู่ด้านบน แล้วเรียงตามเข็มนาฬิกา
    const ringCell = [1, 2, 5, 8, 7, 6, 3, 0], cells = new Array(9);
    for (let k = 0; k < 8; k++) cells[ringCell[k]] = (ch.f.palace + k) % 8;
    cells[4] = 'c';
    const P = ch.C;
    const box = (p) => {
        const c = p === 'c';
        const m = c ? ch.mt.c : ch.mt.g[p], f = c ? ch.ft.c : ch.ft.g[p], b = c ? ch.base.c : ch.base.g[p], a = c ? ch.an.c : ch.an.g[p];
        const tag = p === ch.f.palace ? '<span class="absolute left-1/2 -translate-x-1/2 top-0.5 text-[9px] font-bold px-1 rounded bg-red-600">向</span>'
                  : p === ch.s.palace ? '<span class="absolute left-1/2 -translate-x-1/2 top-0.5 text-[9px] font-bold px-1 rounded bg-blue-600">坐</span>' : '';
        const ring = (n) => n === P ? 'outline outline-2 outline-green-400 rounded-sm' : '';
        return `<div class="relative bg-slate-900/80 rounded-md h-[74px] font-mono">${tag}
            <span class="absolute left-1.5 top-0.5 text-[17px] font-black text-amber-400 ${ring(m)}">${m}</span>
            <span class="absolute right-1.5 top-0.5 text-[17px] font-black text-blue-400 ${ring(f)}">${f}</span>
            <span class="absolute inset-x-0 top-[22px] text-center text-[22px] font-bold text-slate-500">${b}</span>
            <span class="absolute left-1.5 bottom-0.5 text-[9px] font-sans text-slate-400">${c ? 'กลาง' : HOUSE_PALACES[p] + ' ' + HOUSE_PALACE_SHORT[p]}</span>
            <span class="absolute right-1 bottom-1 text-[10px] font-black px-1 rounded ${a === 5 ? 'bg-red-400' : 'bg-amber-400'} text-slate-900">${a}</span></div>`;
    };
    const r = housePeriodRange(ch.P);
    const pats = ch.pat.length ? ch.pat.map(x => `<div class="mt-2 rounded-lg px-2 py-1.5 text-[10px] md:text-[11px] border ${x.k === 'good' ? 'border-emerald-600 text-emerald-300' : x.k === 'bad' ? 'border-red-600 text-red-300' : 'border-amber-500 text-amber-200'}"><b class="cn-char">${x.c}</b> <b>${x.th}</b> · ${x.t}</div>`).join('')
        : '<div class="mt-2 text-[10px] text-slate-400">ทิศปกติ ไม่เข้าเกณฑ์ผังพิเศษ</div>';
    const warn = houseWarning(house.facing);
    el.innerHTML = `
        <div class="text-[10px] md:text-[11px] text-slate-300 mb-2">นั่ง <b class="cn-char">${HOUSE_M24[ch.s.m]}</b> ${norm360(house.facing + 180).toFixed(1)}° · หัน <b class="cn-char">${HOUSE_M24[ch.f.m]}</b> ${house.facing.toFixed(1)}° · ผังยุค ${ch.P} (${r[0]}–${r[1]})${ch.C !== ch.P ? ` · ตอนนี้ยุค ${ch.C}` : ''}</div>
        <div class="grid grid-cols-3 gap-[3px] bg-slate-600 p-[3px] rounded-lg">${cells.map(box).join('')}</div>
        <div class="flex flex-wrap justify-center gap-x-3 mt-1.5 text-[9px]"><span class="text-amber-400">■ ดาวภูเขา</span><span class="text-blue-400">■ ดาวน้ำ</span><span class="text-slate-400">■ ดาวยุค</span><span class="text-amber-400">▣ ดาวจรปี ${state.calc.timeBazi.solarYear}</span><span class="text-green-400">□ ดาวรุ่งยุค ${ch.C}</span></div>
        ${pats}
        ${warn ? `<div class="mt-2 text-[10px] text-amber-300">${warn}</div>` : ''}`;
}

// ---------- ตั้งค่าบ้าน (แท็บตั้งค่า) ----------
const houseEls = {
    info: document.getElementById('houseInfo'), saveBtn: document.getElementById('houseSaveBtn'),
    facing: document.getElementById('houseFacing'), year: document.getElementById('houseYear'), period: document.getElementById('housePeriod')
};
(function initHouseForm() {
    if (!houseEls.period) return;
    houseEls.period.innerHTML = '<option value="auto">อัตโนมัติจากปีที่สร้าง</option>' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => { const r = housePeriodRange(p); return `<option value="${p}">ยุค ${p} (${r[0]}–${r[1]})</option>`; }).join('');
    houseEls.year.value = house ? house.year : new Date().getFullYear();
    houseEls.period.value = house ? String(house.period) : 'auto';
    if (house) houseEls.facing.value = house.facing.toFixed(1);
    houseEls.saveBtn.addEventListener('click', () => houseSaveFacing(displayDegree));
    houseEls.facing.addEventListener('change', () => { const v = parseFloat(houseEls.facing.value); if (!isNaN(v)) houseSaveFacing(v); });
    houseEls.year.addEventListener('change', () => { const v = parseInt(houseEls.year.value, 10); if (house && v >= 1864 && v <= 2163) { house.year = v; houseSave(); houseRefresh(); } });
    houseEls.period.addEventListener('change', () => { if (house) { house.period = houseEls.period.value; houseSave(); houseRefresh(); } });
    houseUpdateInfo();
})();
function houseUpdateInfo() {
    if (!houseEls.info) return;
    if (!house) { houseEls.info.textContent = 'ยังไม่ได้บันทึกทิศบ้าน'; return; }
    const f = houseMountainOf(house.facing);
    houseEls.info.innerHTML = `หัน <b class="cn-char text-yellow-300">${HOUSE_M24[f.m]}</b> ${house.facing.toFixed(1)}° · นั่ง <b class="cn-char text-blue-300">${HOUSE_M24[houseMountainOf(house.facing + 180).m]}</b> · ยุค ${housePeriod()}`;
}
function houseSaveFacing(deg) {
    const facing = Math.round(norm360(deg) * 10) / 10;
    const year = parseInt(houseEls.year.value, 10) || new Date().getFullYear();
    house = { facing, year, period: houseEls.period.value || 'auto', savedAt: Date.now() };
    houseSave();
    houseEls.facing.value = facing.toFixed(1);
    houseMeasuring = false;
    if (state.isCompassActive) stopCompass();
    const warn = houseWarning(facing);
    showToast(`บันทึกทิศหน้าบ้าน ${facing.toFixed(1)}° แล้ว` + (warn ? '\n' + warn : ''));
    houseLockDial();
    houseRefresh();
}
function houseRefresh() {
    houseUpdateInfo();
    renderHousePanel();
    if (typeof renderPersonDetail === 'function') renderPersonDetail();
    if (state.viewMode === 'HOUSE') { updateStatusBadge(); draw2DTexture(); updateAdviceBox(state.currentDegree); }
}
// หมุนจานไปที่ทิศหน้าบ้านและหยุดไว้ (ให้แปลนกับจานตรงกัน)
function houseLockDial() {
    if (!house) return;
    if (state.isCompassActive) stopCompass();
    targetDegree = displayDegree = house.facing;
    luopanMesh.rotation.z = house.facing * Math.PI / 180;
    els.manualDegree.value = house.facing;
    state.currentDegree = house.facing;
    draw2DTexture();
    updateAdviceBox(house.facing);
}
// วัดทิศบ้านใหม่: เปิดเข็มทิศ แล้วกดบันทึกเมื่อหัวเครื่องชี้ออกหน้าบ้าน
function houseStartMeasure() {
    houseMeasuring = true;
    if (!state.isCompassActive) els.compassBtn.click();
    showToast('หันหัวเครื่องออกหน้าบ้าน\nแล้วกด "บันทึกทิศนี้"');
    updateStatusBadge();
}

// เข้าโหมดดาวเหินของบ้าน: ล็อคจานที่ทิศบ้าน
document.querySelectorAll('.layer-btn[data-layer="HOUSE"]').forEach(b => b.addEventListener('click', () => houseLockDial()));
els.quickLayerBtn.addEventListener('click', () => { if (state.viewMode === 'HOUSE') houseLockDial(); });
// เลื่อนแถบปรับองศาในโหมดนี้: วาดตัวเลขใหม่ให้ตั้งตรงเมื่อปล่อยมือ
els.manualDegree.addEventListener('change', () => { if (state.viewMode === 'HOUSE') draw2DTexture(); });
