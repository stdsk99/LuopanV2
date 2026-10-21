// หน้าวิเคราะห์บ้าน (plan.html): แปลน + ตาราง 9 ช่อง (หรือวงกลม 8 ทิศ) + สรุปห้องต่อห้อง
// สูตรดาวเหินมาจาก js/fs-core.js และตาราง 八宅 จาก js/person-core.js (ชุดเดียวกับหน้าเข็มทิศ)

// ---------- ข้อมูลแปลน (localStorage: luopan_plan) ----------
const PLAN_KEY = 'luopan_plan';
const newFloor = (name) => ({ name, img: null, aspect: 0.75, rect: null, front: 0, missing: [], rooms: {} });
let plan = null;
try { plan = JSON.parse(localStorage.getItem(PLAN_KEY) || 'null'); } catch (e) { plan = null; }
if (!plan || !Array.isArray(plan.floors) || !plan.floors.length) plan = { floors: [newFloor('ชั้น 1')], cur: 0, mode: 'grid', layer: 'both' };
plan.cur = Math.min(plan.cur || 0, plan.floors.length - 1);
const floor = () => plan.floors[plan.cur];
function planSave() {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); return true; }
    catch (e) {
        // รูปใหญ่เกินพื้นที่: เก็บข้อมูลอื่นไว้ ไม่เก็บรูป
        try { localStorage.setItem(PLAN_KEY, JSON.stringify({ ...plan, floors: plan.floors.map(f => ({ ...f, img: null })) })); } catch (e2) {}
        setHint('บันทึกรูปแปลนไว้ในเครื่องไม่ได้ (พื้นที่เต็ม) ข้อมูลอื่นบันทึกแล้ว เปิดครั้งหน้าต้องเลือกรูปใหม่', 'warn');
        return false;
    }
}

// ---------- ข้อมูลเจ้าของบ้าน (ชุดเดียวกับหน้าเข็มทิศ) ----------
const owner = {
    birth: localStorage.getItem('luopan_birthDate') || '1981-06-25T10:16',
    gender: localStorage.getItem('luopan_gender') || 'F'
};

// ---------- คำนวณ ----------
let calcNow = null; // { chart, kua, annualYear, P = ยุคของผังบ้าน, C = ยุคปัจจุบัน }
function computeAll() {
    const now = getExactPillars(new Date());
    const y = now.solarYear;
    let annual = 3 - ((y - 2024) % 9); while (annual <= 0) annual += 9; while (annual > 9) annual -= 9;
    const pb = getExactPillars(new Date(owner.birth));
    const kua = personKuaOf(pb.solarYear, owner.gender);
    // ดาวรุ่ง/ถอย เทียบกับยุคปัจจุบันตามวันที่ (เหมือน APK F04) ส่วนสภาพผังเทียบกับยุคของผังบ้าน
    const C = houseCurrentPeriod(y);
    const chart = house ? houseChart(house.facing, housePeriod(), annual, C) : null;
    // ดาวจรเดือน (ใช้ตรวจกลุ่มดาวพิเศษ)
    const month = houseFly(houseMonthStar(now.year, now.month), true);
    calcNow = { chart, kua, annualYear: y, P: housePeriod(), C, month };
}

// ตำแหน่งช่องในตาราง (0..8 เรียงซ้ายไปขวา บนลงล่าง) วนตามเข็มนาฬิกาจากช่องบนกลาง
const RING = [1, 2, 5, 8, 7, 6, 3, 0];
// วังของช่อง g: 'C' = กลางบ้าน, 0..7 = N NE E SE S SW W NW
function palaceOfCell(g) {
    if (g === 4) return 'C';
    const k = RING.indexOf(g), front = floor().front;
    return (calcNow.chart.f.palace + (((k - 2 * front) % 8) + 8) % 8) % 8;
}
function starsOf(pal) {
    const ch = calcNow.chart;
    const mo = calcNow.month;
    if (pal === 'C') return { m: ch.mt.c, f: ch.ft.c, b: ch.base.c, a: ch.an.c, mo: mo.c };
    return { m: ch.mt.g[pal], f: ch.ft.g[pal], b: ch.base.g[pal], a: ch.an.g[pal], mo: mo.g[pal] };
}

// ประเภทห้องจากชื่อ (ใช้ปรับน้ำหนักดาว)
function roomType(name) {
    const n = (name || '').trim();
    if (/น้ำ|ส้วม|สุขา|ซักล้าง|ซักผ้า/.test(n)) return 'bath';
    if (/ครัว/.test(n)) return 'kitchen';
    if (/นอน/.test(n)) return 'bed';
    if (/ประตู|ทางเข้า/.test(n)) return 'door';
    if (/นั่งเล่น|รับแขก|โถง|ทีวี/.test(n)) return 'living';
    if (/ทำงาน|ออฟฟิศ|อ่านหนังสือ|เรียน|ค้าขาย|ร้าน/.test(n)) return 'work';
    if (/บันได/.test(n)) return 'stairs';
    if (/เก็บ|โกดัง|จอดรถ/.test(n)) return 'store';
    if (/พระ|บูชา|หิ้ง/.test(n)) return 'shrine';
    return 'any';
}
const TL_SCORE = { wang: 3, sheng: 2, tui: 0, shuai: -1, sha: -3, lock: -1.5 };
const WEIGHT = { bed: [1.5, 0.5], door: [0.5, 1.5], living: [0.7, 1.3], work: [0.7, 1.3], kitchen: [0.5, 0.5], bath: [0.5, 0.5], store: [0.5, 0.5], stairs: [1, 0.5], shrine: [1.2, 0.5], any: [1, 1] };
const DIR_SHORT = { N: 'เหนือ', NE: 'อีสาน', E: 'ตะวันออก', SE: 'อาคเนย์', S: 'ใต้', SW: 'หรดี', W: 'ตะวันตก', NW: 'พายัพ' };

// วิเคราะห์ช่อง g ของชั้นปัจจุบัน
function analyzeCell(g) {
    const fl = floor(), name = fl.rooms[g] || '', type = roomType(name);
    const res = { g, name, type, pal: null, code: null, st: null, e8: null, score: 0, verdict: 'warn', label: 'ปานกลาง', notes: [], missing: fl.missing.includes(g) };
    if (!calcNow.chart) { res.verdict = 'none'; res.label = '—'; return res; }
    const pal = palaceOfCell(g), P = calcNow.P, C = calcNow.C;
    res.pal = pal; res.code = pal === 'C' ? 'C' : HOUSE_PALACES[pal];
    const st = starsOf(pal); res.st = st;
    if (pal !== 'C') res.e8 = personStarOf(res.code, calcNow.kua);
    if (res.missing) {
        const fam = PERSON_FAMILY_OF_PALACE[res.code];
        res.verdict = 'miss'; res.label = 'มุมขาด';
        res.notes.push(`มุม${DIR_SHORT[res.code]} (${PERSON_TRIGRAM_OF_PALACE[res.code]} = ${fam}) ขาดหาย ตำราถือว่ากระทบ${fam}`);
        res.notes.push('เติมด้วยไฟส่องขึ้น กระจก หรือต้นไม้ที่ผนังด้านนั้น');
        return res;
    }
    let tm = houseTimeliness(st.m, C).k, tf = houseTimeliness(st.f, C).k;
    // ดาวรุ่งที่ติดอยู่กลางบ้านถือว่าถูกล็อค (入囚) ไม่นับเป็นดาวรุ่ง
    if (pal === 'C') { if (st.m === C) tm = 'lock'; if (st.f === C) tf = 'lock'; }
    const [wm, wf] = WEIGHT[type];
    let score = wm * TL_SCORE[tm] + wf * TL_SCORE[tf];
    const e8 = res.e8, sink = ['kitchen', 'bath', 'store'].includes(type);
    if (e8) {
        const v = e8.rank === 1 ? 3 : e8.rank <= 4 ? 2 : e8.rank === 5 ? -1 : e8.rank === 8 ? -3 : -2;
        score += sink ? -v * 0.4 : v;
    }
    res.score = score;
    // ความหมายคู่ดาวภูเขา+น้ำ (js/fs-pairs.js): ดาวรุ่ง/กำลังมาและไม่มีดาว 5 → อ่านด้านดี นอกนั้นอ่านด้านร้าย
    const pr = fsPair(st.m, st.f), five = st.m === 5 || st.f === 5;
    const lively = ['wang', 'sheng'].includes(tm) || ['wang', 'sheng'].includes(tf);
    res.pair = { key: pr.key, t: pr.t, good: lively && !five && !/ไม่มีด้านดี/.test(pr.g), r: pr.r };
    res.pair.text = res.pair.good ? pr.g : pr.b;
    // ดาวจรปีมาเจอดาวภูเขา/น้ำ เป็นคู่ร้าย
    res.trigger = [st.m, st.f].map(x => fsPair(st.a, x)).filter(q => FS_TRIGGER_BAD.includes(q.key))
        .filter((q, i, arr) => arr.findIndex(z => z.key === q.key) === i)
        .map(q => `ปีนี้ดาวจร ${st.a} มาเจอเป็นคู่ ${q.key} (${q.t}): ${q.b}`);
    // คู่ดาวกับดาวยุค (APK F04 แสดง ภูเขา+ยุค และ ยุค+น้ำ ด้วย) อ่านด้านตามจังหวะของดาวภูเขา/น้ำตัวนั้น
    const side = (x, k) => { const q = fsPair(x, st.b), ok = ['wang', 'sheng'].includes(k) && x !== 5 && st.b !== 5 && !/ไม่มีด้านดี/.test(q.g); return `${q.key} ${q.t}: ${ok ? q.g : q.b}`; };
    res.basePairs = [`ภูเขา+ยุค ${side(st.m, tm)}`, `ยุค+น้ำ ${side(st.f, tf)}`];
    // กลุ่มดาวพิเศษ (รวมดาวจรปีและเดือน)
    const ord = { bad: 0, mix: 1, good: 2 };
    res.groups = fsGroups(st).sort((x, y) => ord[x.k] - ord[y.k]);
    // เหตุผลที่อ่านเข้าใจง่าย เรียงจากสำคัญ
    const n = res.notes;
    if (st.m === C && st.f === C) n.push(`ดาวรุ่งคู่ ${C}-${C}`);
    else {
        if (tf === 'wang') n.push(`ดาวน้ำ ${st.f} รุ่ง ดีเรื่องเงิน`);
        else if (tf === 'sheng') n.push(`ดาวน้ำ ${st.f} กำลังมา`);
        if (tm === 'wang') n.push(`ดาวภูเขา ${st.m} รุ่ง ดีเรื่องคนและสุขภาพ`);
        else if (tm === 'sheng') n.push(`ดาวภูเขา ${st.m} กำลังมา`);
    }
    // บ้านสร้างยุคก่อน: ดาวที่เคยรุ่งตอนสร้าง ตอนนี้ถอยแล้ว
    if (P !== C) {
        if (st.f === P) n.push(`ดาวน้ำ ${P} เคยรุ่งในยุค ${P} ตอนนี้ยุค ${C} ถอยแล้ว`);
        if (st.m === P) n.push(`ดาวภูเขา ${P} เคยรุ่งในยุค ${P} ตอนนี้ยุค ${C} ถอยแล้ว`);
    }
    if (st.m === 5 || st.f === 5) n.push('มีดาว 5 (ร้าย) ระวังอุบัติเหตุ');
    if (e8) {
        if (sink && !e8.good) n.push(`${name || 'ห้องนี้'}อยู่ทิศ ${e8.c} (ร้าย) ของเจ้าของ ช่วยกดสิ่งไม่ดี`);
        else if (sink && e8.good) n.push(`เสียทิศ ${e8.c} (ดี) ของเจ้าของไปกับ${name || 'ห้องนี้'}`);
        else n.push(`ทิศ ${e8.c} ของเจ้าของ: ${e8.th}`);
    }
    if (type === 'bed' && e8 && !e8.good) {
        const row = PERSON_8M_TABLE[calcNow.kua];
        n.push(`หันหัวเตียงไป${DIR_SHORT[row[1]]}หรือ${DIR_SHORT[row[2]]}`);
    }
    if (type === 'door' && tf === 'sha') n.push('ประตูโดนดาว 5 ใช้โลหะ/กระดิ่งลมช่วยสลาย');
    if (pal !== 'C') {
        const zz = houseZeroDirs(C).find(z => z.pal === pal && (z.k === 'zheng' || z.k === 'ling'));
        if (zz) n.push(`ทิศ${zz.cn} (${zz.th}): ${zz.out}`);
    }
    if (pal === 'C') {
        if (st.f === C || st.m === C) n.push(`ดาว ${C} ของยุคปัจจุบันถูกล็อคกลางบ้าน (入囚) เปิดโล่งจากกลางบ้านไปถึงประตู/หน้าต่าง`);
        n.push('กลางบ้าน รักษาให้สะอาด โปร่ง ไม่วางของหนัก');
    }
    if (st.a === 5) n.push('⚠ ปีนี้ 五黃 จรเข้า ห้ามเคาะ เจาะ ทุบ');
    else if (st.a === 2) n.push('ปีนี้ 二黑 จรเข้า ระวังเจ็บป่วย');
    if (!n.length) n.push(`ดาวภูเขา ${st.m} · ดาวน้ำ ${st.f} ปานกลาง`);
    res.verdict = score >= 4 ? 'good' : score >= 1.5 ? 'good' : score >= -0.5 ? 'warn' : 'bad';
    res.label = score >= 4 ? 'ดีมาก' : score >= 1.5 ? 'ดี' : score >= -0.5 ? 'ปานกลาง' : 'ระวัง';
    if (st.a === 5 && res.verdict === 'good') res.label += ' · ระวังปีนี้';
    return res;
}

// ---------- หน้าจอ ----------
const $ = (id) => document.getElementById(id);
const cv = $('planCanvas'), ctx = cv.getContext('2d');
let tool = null, tmpCorner = null, drag = null, imgEl = null, cssW = 600, cssH = 450, hintTimer = null;

function setHint(text, kind) {
    const h = $('hint');
    // แสดงเสมอ เพื่อไม่ให้แปลนเลื่อนตำแหน่งระหว่างแตะ
    h.textContent = text || 'แตะช่องเพื่อดูสรุปห้อง · ลากจุดสีทองที่มุมหรือขอบเพื่อปรับกรอบตัวบ้าน';
    h.className = 'text-[12px] min-h-[40px] flex items-center rounded-lg px-3 py-2 mb-2 border ' + (kind === 'warn' ? 'text-amber-200 bg-amber-950/40 border-amber-800/60' : 'text-sky-200 bg-sky-950/40 border-sky-800/60');
}
function defaultHint() {
    const fl = floor();
    if (!house) return setHint('ยังไม่ได้บันทึกทิศบ้าน: เปิด "ข้อมูลบ้านและเจ้าของบ้าน" ด้านขวาแล้วใส่องศาหน้าบ้าน หรือวัดด้วยเข็มทิศที่หน้าเข็มทิศ', 'warn');
    if (tool === 'corners') return setHint(tmpCorner ? 'แตะมุมทแยงอีกมุมของตัวบ้าน' : 'แตะมุมหนึ่งของตัวบ้าน แล้วแตะมุมทแยงตรงข้าม (ไม่นับที่จอดรถและบ้านข้าง ๆ)', 'info');
    if (tool === 'missing') return setHint('แตะช่องที่อยู่นอกตัวบ้านเพื่อทำเครื่องหมายมุมขาด แตะซ้ำเพื่อยกเลิก', 'info');
    if (tool === 'name') return setHint('แตะช่องในแปลน แล้วพิมพ์ชื่อห้องในรายการด้านขวา (เช่น ห้องนอนใหญ่ ห้องครัว ประตูหน้า)', 'info');
    if (!fl.img) return setHint('เลือกรูปแปลนบ้าน แล้วแตะมุมตัวบ้าน 2 มุม · ตอนนี้แสดงบนกระดาษเปล่าก่อน', 'info');
    if (!fl.rect) return setHint('กด "จิ้มมุมบ้าน" แล้วแตะมุมตัวบ้าน 2 มุมทแยงกัน', 'info');
    setHint('', 'info');
}

function setPressed(id, v) { document.querySelectorAll('#' + id + ' button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v)))); }
function setTool(t) {
    tool = tool === t ? null : t; tmpCorner = null;
    ['Corners', 'Missing', 'Name'].forEach(k => $('tool' + k).setAttribute('aria-pressed', String(tool === k.toLowerCase())));
    defaultHint(); draw();
}

// ขนาด canvas ตามความกว้างกล่อง และสัดส่วนรูป
function layoutCanvas() {
    const fl = floor();
    cssW = Math.max(260, cv.parentElement.clientWidth - 24);
    cssH = Math.round(cssW * (fl.aspect || 0.75));
    const maxH = Math.max(320, window.innerHeight * 0.78);
    if (cssH > maxH) { cssH = Math.round(maxH); cssW = Math.round(cssH / (fl.aspect || 0.75)); }
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
// กรอบตัวบ้านในพิกัดหน้าจอ
function rectPx() {
    const r = floor().rect || { x0: 0.18, y0: 0.14, x1: 0.82, y1: 0.86 };
    const x0 = Math.min(r.x0, r.x1) * cssW, x1 = Math.max(r.x0, r.x1) * cssW, y0 = Math.min(r.y0, r.y1) * cssH, y1 = Math.max(r.y0, r.y1) * cssH;
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}
const VERDICT_TINT = { good: 'rgba(16,185,129,0.14)', warn: 'rgba(234,179,8,0.12)', bad: 'rgba(239,68,68,0.15)', miss: 'rgba(100,116,139,0.35)', none: 'rgba(0,0,0,0)' };

function draw() {
    layoutCanvas();
    const fl = floor();
    // พื้นหลัง: รูปแปลน หรือกระดาษกริด
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, 0, cssW, cssH);
    if (imgEl && imgEl.complete && imgEl.naturalWidth) ctx.drawImage(imgEl, 0, 0, cssW, cssH);
    else {
        ctx.strokeStyle = 'rgba(100,116,139,0.18)'; ctx.lineWidth = 1;
        for (let x = 0; x <= cssW; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cssH); ctx.stroke(); }
        for (let y = 0; y <= cssH; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssW, y); ctx.stroke(); }
    }
    const R = rectPx(), cw = R.w / 3, chh = R.h / 3;
    const fs = Math.max(9, Math.min(16, Math.min(cw, chh) / 7.5));
    const cells = Array.from({ length: 9 }, (_, g) => analyzeCell(g));

    if (plan.mode === 'grid') {
        cells.forEach((c) => {
            const col = c.g % 3, row = Math.floor(c.g / 3), x = R.x0 + col * cw, y = R.y0 + row * chh;
            ctx.fillStyle = VERDICT_TINT[c.verdict]; ctx.fillRect(x + 2, y + 2, cw - 4, chh - 4);
            if (c.missing) { // ลายเส้นทแยง = มุมขาด
                ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, chh); ctx.clip();
                ctx.strokeStyle = 'rgba(71,85,105,0.55)'; ctx.lineWidth = 1.5;
                for (let k = -chh; k < cw; k += 10) { ctx.beginPath(); ctx.moveTo(x + k, y + chh); ctx.lineTo(x + k + chh, y); ctx.stroke(); }
                ctx.restore();
            }
            drawCellContent(c, x + cw / 2, y + chh / 2, cw, chh, fs);
        });
        ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2;
        for (let i = 1; i < 3; i++) {
            ctx.beginPath(); ctx.moveTo(R.x0 + cw * i, R.y0); ctx.lineTo(R.x0 + cw * i, R.y1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(R.x0, R.y0 + chh * i); ctx.lineTo(R.x1, R.y0 + chh * i); ctx.stroke();
        }
        ctx.restore();
    } else drawPie(R, fs);

    // กรอบตัวบ้าน + จุดจับมุม
    ctx.save(); ctx.setLineDash([9, 6]); ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3; ctx.strokeRect(R.x0, R.y0, R.w, R.h); ctx.restore();
    if (fl.rect) {
        // จุดจับ 4 มุม (วงกลม) และกลางขอบ 4 ด้าน (แท่ง) ลากได้ทุกจุด
        [[R.x0, R.y0], [R.x1, R.y0], [R.x0, R.y1], [R.x1, R.y1]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fillStyle = '#ca8a04'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); });
        const mx = (R.x0 + R.x1) / 2, my = (R.y0 + R.y1) / 2;
        [[mx, R.y0, 26, 8], [mx, R.y1, 26, 8], [R.x0, my, 8, 26], [R.x1, my, 8, 26]].forEach(([x, y, w, hh]) => { ctx.fillStyle = '#ca8a04'; roundRect(x - w / 2, y - hh / 2, w, hh, 4); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); });
    }
    if (selCell >= 0 && plan.mode === 'grid') {
        const cw2 = R.w / 3, ch2 = R.h / 3, sx = R.x0 + (selCell % 3) * cw2, sy = R.y0 + Math.floor(selCell / 3) * ch2;
        ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = '#facc15'; ctx.strokeRect(sx + 3, sy + 3, cw2 - 6, ch2 - 6); ctx.restore();
    }
    if (tmpCorner) { ctx.beginPath(); ctx.arc(tmpCorner[0] * cssW, tmpCorner[1] * cssH, 8, 0, Math.PI * 2); ctx.fillStyle = '#ca8a04'; ctx.fill(); }

    // ป้ายหน้าบ้าน/หลังบ้าน ตามด้านที่เลือก
    if (house && calcNow.chart) {
        const fM = HOUSE_M24[calcNow.chart.f.m], sM = HOUSE_M24[calcNow.chart.s.m];
        const front = fl.front, cx = R.x0 + R.w / 2, cy = R.y0 + R.h / 2;
        const pos = [[cx, R.y0 - 16], [R.x1 + 16, cy], [cx, R.y1 + 16], [R.x0 - 16, cy]];
        pill(`向 หน้าบ้าน ${house.facing.toFixed(1)}° ${fM}`, pos[front], '#dc2626', front % 2 === 1);
        pill(`坐 หลังบ้าน ${houseNorm360(house.facing + 180).toFixed(1)}° ${sM}`, pos[(front + 2) % 4], '#2563eb', front % 2 === 1);
    }
    renderRooms(cells);
    if (selCell >= 0) showCellInfo();
}
function pill(text, [x, y], color, vertical) {
    ctx.save(); ctx.translate(Math.min(Math.max(x, 14), cssW - 14), Math.min(Math.max(y, 12), cssH - 12));
    if (vertical) ctx.rotate(-Math.PI / 2);
    ctx.font = '600 12px Prompt, sans-serif'; const w = ctx.measureText(text).width + 18;
    ctx.fillStyle = color; roundRect(-w / 2, -10, w, 20, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 1);
    ctx.restore();
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }

// เนื้อหาในช่อง: ทิศ ชื่อห้อง กล่องดาว และป้าย 八宅
function drawCellContent(c, cx, cy, cw, chh, fs) {
    const top = cy - chh / 2;
    ctx.textBaseline = 'middle';
    if (!calcNow.chart) {
        if (c.name) { ctx.fillStyle = '#0f172a'; ctx.font = `700 ${fs}px Prompt, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(c.name, cx, cy, cw - 8); }
        return;
    }
    ctx.textAlign = 'left'; ctx.fillStyle = '#334155'; ctx.font = `600 ${fs * 0.75}px Prompt, sans-serif`;
    // ช่องแคบแสดงแค่รหัสทิศ เพื่อไม่ทับป้าย 八宅
    const lab = c.pal === 'C' ? 'กลาง' : (cw < 130 ? c.code : `${c.code} ${DIR_SHORT[c.code]}`);
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.strokeText(lab, cx - cw / 2 + 6, top + fs * 0.8);
    ctx.fillText(lab, cx - cw / 2 + 6, top + fs * 0.8);
    if (c.missing) {
        ctx.textAlign = 'center'; ctx.fillStyle = '#334155'; ctx.font = `700 ${fs * 1.05}px Prompt, sans-serif`;
        ctx.fillText('缺角 มุมขาด', cx, cy, cw - 8);
        ctx.font = `500 ${fs * 0.75}px Prompt, sans-serif`; ctx.fillText(`${PERSON_TRIGRAM_OF_PALACE[c.code]} ${PERSON_FAMILY_OF_PALACE[c.code]}`, cx, cy + fs * 1.2, cw - 8);
        return;
    }
    if (c.name) { ctx.textAlign = 'center'; ctx.fillStyle = '#0f172a'; ctx.font = `700 ${fs * 0.9}px Prompt, sans-serif`; ctx.fillText(c.name, cx, top + fs * 2.1, cw - 10); }
    const showFs = plan.layer !== '8m', show8m = plan.layer !== 'fs';
    if (showFs) starBox(c.st, cx, cy + (c.name ? fs * 0.7 : fs * 0.3), fs);
    if (show8m && c.e8) {
        if (showFs) { // ป้ายเล็กมุมขวาบน
            ctx.font = `600 ${fs * 0.72}px serif`; const w = ctx.measureText(c.e8.c).width + 12;
            ctx.fillStyle = c.e8.good ? '#047857' : '#b91c1c'; roundRect(cx + cw / 2 - w - 5, top + 4, w, fs * 1.15, fs * 0.55); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(c.e8.c, cx + cw / 2 - w / 2 - 5, top + 4 + fs * 0.6);
        } else { // โหมด 八宅 อย่างเดียว: ตัวใหญ่กลางช่อง
            ctx.textAlign = 'center'; ctx.fillStyle = c.e8.good ? '#047857' : '#b91c1c';
            ctx.font = `700 ${fs * 1.6}px serif`; ctx.fillText(c.e8.c, cx, cy + fs * 0.4);
            ctx.font = `500 ${fs * 0.75}px Prompt, sans-serif`; ctx.fillText(c.e8.th, cx, cy + fs * 1.8, cw - 8);
        }
    }
    if (c.st.a === 5 && showFs) { ctx.textAlign = 'center'; ctx.fillStyle = '#b91c1c'; ctx.font = `700 ${fs * 0.7}px Prompt, sans-serif`; ctx.fillText('⚠ 五黃 จรปีนี้', cx, cy + chh / 2 - fs * 0.6, cw - 6); }
}
function starBox(st, cx, cy, fs) {
    const P = calcNow.C, w = fs * 5.2, h = fs * 3.6; // กรอบเขียว = ดาวรุ่งของยุคปัจจุบัน
    ctx.fillStyle = 'rgba(15,23,42,0.92)'; roundRect(cx - w / 2, cy - h / 2, w, h, fs * 0.6); ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${fs * 1.45}px Arial, sans-serif`;
    ctx.fillStyle = '#fbbf24'; ctx.fillText(st.m, cx - w * 0.26, cy - h * 0.16);
    ctx.fillStyle = '#60a5fa'; ctx.fillText(st.f, cx + w * 0.26, cy - h * 0.16);
    ctx.font = `700 ${fs * 0.95}px Arial, sans-serif`; ctx.fillStyle = '#94a3b8'; ctx.fillText(st.b, cx - w * 0.05, cy + h * 0.27);
    const bw = fs * 1.05; ctx.fillStyle = st.a === 5 ? '#f87171' : '#fbbf24'; roundRect(cx + w * 0.26 - bw / 2, cy + h * 0.27 - bw / 2, bw, bw, 3); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.font = `900 ${fs * 0.75}px Arial, sans-serif`; ctx.fillText(st.a, cx + w * 0.26, cy + h * 0.28);
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
    if (st.m === P) ctx.strokeRect(cx - w * 0.26 - fs * 0.6, cy - h * 0.16 - fs * 0.8, fs * 1.2, fs * 1.55);
    if (st.f === P) ctx.strokeRect(cx + w * 0.26 - fs * 0.6, cy - h * 0.16 - fs * 0.8, fs * 1.2, fs * 1.55);
}
// วงกลม 8 ทิศ: แบ่งตามองศาเข็มทิศจริงจากกลางกรอบบ้าน
function drawPie(R, fs) {
    if (!calcNow.chart) return;
    const cx = R.x0 + R.w / 2, cy = R.y0 + R.h / 2, front = floor().front, facing = house.facing;
    const screenAng = (deg) => (deg - facing + 90 * front) * Math.PI / 180; // องศาเข็มทิศ -> มุมบนจอ (ตามเข็มนาฬิกาจากด้านบน)
    const L = Math.hypot(R.w, R.h);
    ctx.save(); ctx.beginPath(); ctx.rect(R.x0, R.y0, R.w, R.h); ctx.clip();
    for (let p = 0; p < 8; p++) {
        const a = screenAng(p * 45 + 22.5);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(a) * L, cy - Math.cos(a) * L);
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    const r = Math.min(R.w, R.h) * 0.33, showFs = plan.layer !== '8m', show8m = plan.layer !== 'fs';
    for (let p = 0; p < 8; p++) {
        const a = screenAng(p * 45), x = cx + Math.sin(a) * r, y = cy - Math.cos(a) * r, code = HOUSE_PALACES[p];
        const st = starsOf(p), e8 = personStarOf(code, calcNow.kua);
        ctx.fillStyle = '#334155'; ctx.font = `600 ${fs * 0.75}px Prompt, sans-serif`; ctx.textAlign = 'center';
        ctx.fillText(`${code} ${DIR_SHORT[code]}`, x, y - fs * 2.6);
        if (showFs) starBox(st, x, y, fs * 0.85);
        if (show8m && e8) {
            ctx.font = `700 ${fs * 0.8}px serif`; ctx.fillStyle = e8.good ? '#047857' : '#b91c1c';
            ctx.fillText(e8.c, x, y + (showFs ? fs * 2.3 : 0));
        }
    }
    if (showFs) starBox(starsOf('C'), cx, cy, fs * 0.8);
}

// ---------- รายการห้อง ----------
const VERDICT_CHIP = { good: 'bg-emerald-800 text-emerald-100', warn: 'bg-amber-800 text-amber-100', bad: 'bg-red-800 text-red-100', miss: 'bg-zinc-600 text-zinc-100', none: 'bg-slate-700 text-slate-200' };
const VERDICT_ORDER = { good: 0, warn: 1, bad: 2, miss: 3, none: 4 };
// 零正神: ทิศที่ภายนอกควรสูง/ควรมีน้ำ และภายในควรโปร่ง/ทึบ (เทียบยุคปัจจุบัน)
function zeroBox() {
    const zs = houseZeroDirs(calcNow.C); if (!zs.length) return '';
    const PS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return `<details class="text-[12px] rounded-lg px-3 py-2 border border-sky-700/70 bg-sky-950/30"><summary class="cursor-pointer text-sky-200"><b class="cn-char">零正神</b> <b>ทิศภายนอกควรสูง / ควรมีน้ำ</b> (ยุค ${calcNow.C})</summary>
        <div class="mt-1.5 space-y-1">${zs.map(z => `<div><b class="${z.k.includes('ling') ? 'text-sky-300' : 'text-amber-300'}">${PS[z.pal]} ${DIR_SHORT[PS[z.pal]]}</b> · <span class="cn-char">${z.cn}</span> ${z.th} <span class="text-slate-400">(${z.when})</span><br><span class="text-slate-300">นอกบ้าน: ${z.out} · ในบ้าน: ${z.ins}</span></div>`).join('')}
        <div class="text-[10px] text-slate-500">ถ้าทิศของยุคนี้กับยุคหน้าขัดกัน ให้ยึดยุคปัจจุบันก่อน</div></div></details>`;
}
function renderRooms(cells) {
    $('floorLabel').textContent = '· ' + floor().name;
    const pt = $('patterns');
    if (!calcNow.chart) { pt.innerHTML = ''; }
    else {
        const ch = calcNow.chart, warn = houseWarning(house.facing);
        pt.innerHTML = ch.pat.map(x => `<div class="text-[12px] rounded-lg px-3 py-2 border ${x.k === 'good' ? 'border-emerald-600 text-emerald-200' : x.k === 'bad' ? 'border-red-600 text-red-200' : 'border-amber-500 text-amber-200'}"><b class="cn-char">${x.c}</b> <b>${x.th}</b> · ${x.t}</div>`).join('')
            + (warn ? `<div class="text-[11px] text-amber-300">${warn}</div>` : '')
            + zeroBox();
    }
    const sorted = cells.slice().sort((a, b) => (VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict]) || (b.score - a.score));
    const box = $('rooms');
    const focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.g : null;
    box.innerHTML = sorted.map(c => {
        const head = !calcNow.chart ? '—' : (c.pal === 'C' ? 'กลาง' : c.code);
        const sub = !calcNow.chart ? '' : (c.pal === 'C' ? 'กลางบ้าน' : DIR_SHORT[c.code]);
        const stars = c.st && !c.missing ? `<span class="text-amber-400">${c.st.m}</span> <span class="text-blue-400">${c.st.f}</span>` : '—';
        return `<div class="room-card grid grid-cols-[64px_minmax(0,1fr)] gap-2 p-2 rounded-xl border border-slate-800 bg-slate-950/60" id="room-${c.g}">
            <div class="text-center rounded-lg bg-slate-800 py-1 text-[11px] leading-tight"><div>${head}</div><div class="text-[17px] font-black font-mono">${stars}</div><div class="text-slate-400">${sub}</div></div>
            <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                    <input data-g="${c.g}" value="${(c.name || '').replace(/"/g, '&quot;')}" placeholder="ตั้งชื่อห้อง" aria-label="ชื่อห้องช่อง ${head}" class="room-name min-w-0 flex-1 bg-transparent border-b border-slate-700 focus:border-yellow-500 outline-none text-[14px] font-semibold text-white py-0.5" style="font-size:14px">
                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${VERDICT_CHIP[c.verdict]}">${c.label}</span>
                    ${c.e8 ? `<span class="cn-char text-[12px] ${c.e8.good ? 'text-emerald-300' : 'text-red-300'}">${c.e8.c}</span>` : ''}
                </div>
                ${c.st && !c.missing ? `<div class="font-mono text-[11px] text-slate-400 mt-0.5">ภูเขา ${c.st.m} · น้ำ ${c.st.f} · ยุค ${c.st.b} · จรปี ${c.st.a}</div>` : ''}
                <div class="text-[12px] text-slate-300 leading-relaxed mt-0.5">${c.notes.join(' · ') || (calcNow.chart ? '' : 'ใส่ทิศบ้านเพื่อดูผล')}</div>
                ${c.pair ? `<div class="text-[12px] leading-relaxed mt-1 ${c.pair.good ? 'text-emerald-200' : 'text-amber-200'}"><b>คู่ดาว ${c.st.m}-${c.st.f} ${c.pair.t}:</b> ${c.pair.text}</div>
                <div class="text-[11px] text-sky-300 leading-relaxed">เสริมดีลดร้าย: ${c.pair.r}</div>` : ''}
                ${c.trigger && c.trigger.length ? `<div class="text-[11px] text-red-300 leading-relaxed">⚠ ${c.trigger.join(' · ')}</div>` : ''}
                ${c.groups && c.groups.length ? c.groups.slice(0, 2).map(gp => `<div class="text-[11px] leading-relaxed ${gp.k === 'good' ? 'text-emerald-300' : gp.k === 'bad' ? 'text-red-300' : 'text-amber-200'}">✦ กลุ่มดาว ${gp.label}: ${gp.t}</div>`).join('') : ''}
                ${c.basePairs ? `<details class="mt-0.5"><summary class="text-[11px] text-slate-400 cursor-pointer">คู่ดาวกับดาวยุค${c.groups.length > 2 ? ` · กลุ่มดาวอีก ${c.groups.length - 2} ชุด` : ''}</summary><div class="text-[11px] text-slate-400 leading-relaxed">${c.basePairs.concat(c.groups.slice(2).map(gp => `✦ ${gp.label}: ${gp.t}`)).join('<br>')}</div></details>` : ''}
            </div></div>`;
    }).join('');
    box.querySelectorAll('.room-name').forEach(inp => {
        inp.addEventListener('change', () => { const fl = floor(), g = +inp.dataset.g; const v = inp.value.trim(); if (v) fl.rooms[g] = v; else delete fl.rooms[g]; planSave(); draw(); });
    });
    if (focused !== null) { const again = box.querySelector(`.room-name[data-g="${focused}"]`); if (again) again.focus(); }
    plan.mode === 'pie' && pt.insertAdjacentHTML('beforeend', '<div class="text-[11px] text-slate-400">โหมดวงกลม: ดาวบนแปลนแบ่งตามองศาจริง ส่วนสรุปห้องใช้ช่องในตาราง 9 ช่อง</div>');
}

// ---------- แตะ/ลากบนแปลน ----------
function ptr(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
function cellAt(nx, ny) {
    const R = rectPx(), x = nx * cssW, y = ny * cssH;
    if (x < R.x0 || x > R.x1 || y < R.y0 || y > R.y1) return -1;
    return Math.min(2, Math.floor((y - R.y0) / (R.h / 3))) * 3 + Math.min(2, Math.floor((x - R.x0) / (R.w / 3)));
}
// จุดจับกรอบตัวบ้าน: มุมทั้ง 4 และขอบทั้ง 4 (นิ้วได้ระยะจับกว้างกว่าเมาส์)
function grabAt(nx, ny, touch) {
    if (!floor().rect) return null;
    const R = rectPx(), x = nx * cssW, y = ny * cssH, rc = touch ? 30 : 16, re = touch ? 20 : 10;
    const corners = { nw: [R.x0, R.y0], ne: [R.x1, R.y0], sw: [R.x0, R.y1], se: [R.x1, R.y1] };
    let best = null, bd = rc;
    for (const k in corners) { const d = Math.hypot(x - corners[k][0], y - corners[k][1]); if (d < bd) { bd = d; best = k; } }
    if (best) return best;
    const inX = x > R.x0 && x < R.x1, inY = y > R.y0 && y < R.y1;
    if (inX && Math.abs(y - R.y0) < re) return 'n';
    if (inX && Math.abs(y - R.y1) < re) return 's';
    if (inY && Math.abs(x - R.x0) < re) return 'w';
    if (inY && Math.abs(x - R.x1) < re) return 'e';
    return null;
}
const GRAB_CURSOR = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' };
let down = null;   // จุดที่แตะลง (ใช้แยก "แตะ" กับ "ลาก")
let selCell = -1;  // ช่องที่เลือกอยู่ (ไฮไลต์บนแปลน ไม่เลื่อนหน้าจอเอง)
cv.addEventListener('pointerdown', (e) => {
    const [nx, ny] = ptr(e), fl = floor(), touch = e.pointerType !== 'mouse';
    if (tool !== 'corners') {
        const gk = grabAt(nx, ny, touch);
        if (gk) { drag = gk; cv.setPointerCapture(e.pointerId); return; }
    }
    if (tool === 'corners') {
        if (!tmpCorner) { tmpCorner = [nx, ny]; defaultHint(); draw(); return; }
        if (Math.abs(nx - tmpCorner[0]) * cssW < 30 || Math.abs(ny - tmpCorner[1]) * cssH < 30) { setHint('กรอบเล็กเกินไป แตะมุมทแยงที่ห่างออกไป', 'warn'); return; }
        fl.rect = { x0: Math.min(tmpCorner[0], nx), y0: Math.min(tmpCorner[1], ny), x1: Math.max(tmpCorner[0], nx), y1: Math.max(tmpCorner[1], ny) };
        tmpCorner = null; planSave(); setTool('corners'); return;
    }
    down = { x: e.clientX, y: e.clientY, nx, ny };
});
cv.addEventListener('pointermove', (e) => {
    if (!drag) {
        if (e.pointerType === 'mouse') { const [nx, ny] = ptr(e), gk = tool !== 'corners' && grabAt(nx, ny, false); cv.style.cursor = gk ? GRAB_CURSOR[gk] : 'crosshair'; }
        return;
    }
    const [nx, ny] = ptr(e).map(v => Math.min(1, Math.max(0, v))), r = floor().rect, m = 0.05;
    if (drag.includes('n')) r.y0 = Math.min(ny, r.y1 - m);
    if (drag.includes('s')) r.y1 = Math.max(ny, r.y0 + m);
    if (drag.includes('w')) r.x0 = Math.min(nx, r.x1 - m);
    if (drag.includes('e')) r.x1 = Math.max(nx, r.x0 + m);
    draw();
});
const endDrag = (e) => {
    if (drag) { drag = null; planSave(); return; }
    if (!down || e.type === 'pointercancel') { down = null; return; }
    // นับเป็น "แตะ" เมื่อนิ้วขยับไม่เกิน 10px เท่านั้น
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), d = down; down = null;
    if (moved > 10) return;
    const fl = floor(), g = cellAt(d.nx, d.ny);
    if (g < 0) { selCell = -1; showCellInfo(); draw(); return; }
    if (tool === 'missing') {
        if (g === 4) { setHint('กลางบ้านเป็นมุมขาดไม่ได้', 'warn'); return; }
        fl.missing = fl.missing.includes(g) ? fl.missing.filter(x => x !== g) : fl.missing.concat(g);
        planSave(); draw(); return;
    }
    if (tool === 'name') { goToCard(g, true); return; }
    // แตะช่องปกติ: เลือกช่องและแสดงสรุปสั้นใต้แปลน ไม่เลื่อนหน้าจอเอง
    selCell = selCell === g ? -1 : g;
    showCellInfo(); draw();
};
cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
function goToCard(g, focusName) {
    const card = $('room-' + g); if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('flash'); setTimeout(() => card.classList.remove('flash'), 1200);
    if (focusName) { const inp = card.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 300); }
}
// สรุปสั้นของช่องที่เลือก ใต้แปลน พร้อมปุ่มไปดูรายละเอียด
function showCellInfo() {
    const box = $('cellInfo');
    if (selCell < 0 || !calcNow.chart) { box.hidden = true; return; }
    const c = analyzeCell(selCell);
    const head = c.pal === 'C' ? 'กลางบ้าน' : `${c.code} ${DIR_SHORT[c.code]}`;
    const st = c.st && !c.missing ? ` · ภูเขา ${c.st.m} น้ำ ${c.st.f}` : '';
    box.innerHTML = `<div class="min-w-0 flex-1"><b>${c.name || head}</b>${c.name ? ` <span class="text-slate-400">${head}</span>` : ''}${st} · <span class="${c.verdict === 'good' ? 'text-emerald-300' : c.verdict === 'bad' ? 'text-red-300' : 'text-amber-200'}">${c.label}</span>
        <div class="text-[11px] text-slate-400 truncate">${c.pair ? c.pair.t + ': ' + c.pair.text : c.notes[0] || ''}</div></div>
        <button type="button" id="cellGo" class="tool shrink-0">ดูรายละเอียด ↓</button>`;
    box.hidden = false;
    $('cellGo').addEventListener('click', () => goToCard(selCell, false));
}

// ---------- รูปแปลน ----------
function loadFloorImage() {
    selCell = -1; if ($('cellInfo')) $('cellInfo').hidden = true;
    const fl = floor();
    if (!fl.img) { imgEl = null; draw(); return; }
    imgEl = new Image(); imgEl.onload = draw; imgEl.src = fl.img;
}
$('planFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const im = new Image();
        im.onload = () => {
            // ย่อรูปให้ด้านยาวไม่เกิน 1400 px เพื่อเก็บในเครื่องได้
            const k = Math.min(1, 1400 / Math.max(im.naturalWidth, im.naturalHeight));
            const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            const fl = floor();
            fl.img = c.toDataURL('image/jpeg', 0.8); fl.aspect = c.height / c.width; fl.rect = null; fl.missing = [];
            planSave(); loadFloorImage(); tool = null; setTool('corners');
        };
        im.onerror = () => setHint('เปิดรูปนี้ไม่ได้ ลองไฟล์ JPG หรือ PNG', 'warn');
        im.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

// ---------- ชั้นของบ้าน ----------
function renderFloors() {
    const bar = $('floorBar');
    bar.innerHTML = plan.floors.map((f, i) => `<button type="button" data-i="${i}" class="tool" aria-pressed="${i === plan.cur}">${f.name}</button>`).join('')
        + `<button type="button" id="addFloor" class="tool">+ เพิ่มชั้น</button>`
        + (plan.floors.length > 1 ? `<button type="button" id="delFloor" class="tool text-red-300">ลบ${floor().name}</button>` : '');
    bar.querySelectorAll('button[data-i]').forEach(b => b.addEventListener('click', () => { plan.cur = +b.dataset.i; planSave(); syncControls(); loadFloorImage(); }));
    $('addFloor').addEventListener('click', () => {
        const nf = newFloor('ชั้น ' + (plan.floors.length + 1)); nf.front = floor().front;
        plan.floors.push(nf); plan.cur = plan.floors.length - 1; planSave(); syncControls(); loadFloorImage();
    });
    const del = $('delFloor');
    if (del) {
        let armed = false;
        del.addEventListener('click', () => {
            if (!armed) { armed = true; del.textContent = 'กดอีกครั้งเพื่อยืนยันลบ'; setTimeout(() => { armed = false; renderFloors(); }, 3000); return; }
            plan.floors.splice(plan.cur, 1); plan.cur = Math.max(0, plan.cur - 1); planSave(); syncControls(); loadFloorImage();
        });
    }
}

// ---------- ข้อมูลบ้าน/เจ้าของ + ป้ายด้านบน ----------
function renderChips() {
    const c = calcNow, chips = [];
    if (house && c.chart) {
        chips.push(`หัน <b class="text-yellow-300 cn-char">${HOUSE_M24[c.chart.f.m]}</b> ${house.facing.toFixed(1)}° · นั่ง <b class="text-yellow-300 cn-char">${HOUSE_M24[c.chart.s.m]}</b>`);
        const r = housePeriodRange(c.P); chips.push(`ผังยุค <b class="text-yellow-300">${c.P}</b> (${r[0]}–${r[1]})${c.C !== c.P ? ` · ตอนนี้ยุค <b class="text-yellow-300">${c.C}</b>` : ''}`);
    } else chips.push('<span class="text-amber-300">ยังไม่ได้บันทึกทิศบ้าน</span>');
    chips.push(`เจ้าของบ้าน Kua <b class="text-yellow-300">${c.kua}</b> <span class="cn-char">${PERSON_KUA_TRIGRAM[c.kua]}</span> กลุ่ม${personIsEast(c.kua) ? 'ตะวันออก' : 'ตะวันตก'}`);
    chips.push(`ดาวจรปี <b class="text-yellow-300">${c.annualYear}</b>`);
    $('chips').innerHTML = chips.map(t => `<span class="bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1">${t}</span>`).join('');
}
function initSetup() {
    $('inPeriod').innerHTML = '<option value="auto">อัตโนมัติจากปีที่สร้าง</option>' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => { const r = housePeriodRange(p); return `<option value="${p}">ยุค ${p} (${r[0]}–${r[1]})</option>`; }).join('');
    $('inFacing').value = house ? house.facing : '';
    $('inYear').value = house ? house.year : new Date().getFullYear();
    $('inPeriod').value = house ? String(house.period) : 'auto';
    $('inBirth').value = owner.birth; $('inGender').value = owner.gender;
    const saveHouse = () => {
        const f = parseFloat($('inFacing').value), y = parseInt($('inYear').value, 10);
        if (isNaN(f)) return;
        house = { facing: Math.round(houseNorm360(f) * 10) / 10, year: (y >= 1864 && y <= 2163) ? y : new Date().getFullYear(), period: $('inPeriod').value, savedAt: Date.now() };
        houseSave(); refresh();
    };
    ['inFacing', 'inYear', 'inPeriod'].forEach(id => $(id).addEventListener('change', saveHouse));
    $('inBirth').addEventListener('change', () => { owner.birth = $('inBirth').value; try { localStorage.setItem('luopan_birthDate', owner.birth); } catch (e) {} refresh(); });
    $('inGender').addEventListener('change', () => { owner.gender = $('inGender').value; try { localStorage.setItem('luopan_gender', owner.gender); } catch (e) {} refresh(); });
    if (!house) $('setup').open = true;
}
function syncControls() {
    setPressed('frontSeg', floor().front); setPressed('modeSeg', plan.mode); setPressed('layerSeg', plan.layer);
    renderFloors(); defaultHint();
}
function refresh() { computeAll(); renderChips(); defaultHint(); draw(); }

$('toolCorners').addEventListener('click', () => setTool('corners'));
$('toolMissing').addEventListener('click', () => setTool('missing'));
$('toolName').addEventListener('click', () => setTool('name'));
$('frontSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; floor().front = +b.dataset.v; planSave(); setPressed('frontSeg', floor().front); draw(); });
$('modeSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; plan.mode = b.dataset.v; planSave(); setPressed('modeSeg', plan.mode); draw(); });
$('layerSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; plan.layer = b.dataset.v; planSave(); setPressed('layerSeg', plan.layer); draw(); });
// ข้อมูลที่แก้จากหน้าเข็มทิศ (แท็บอื่น) อัปเดตตามทันที
window.addEventListener('storage', (e) => {
    if (e.key === 'luopan_house') { try { house = JSON.parse(e.newValue || 'null'); } catch (x) {} initSetup(); refresh(); }
    if (e.key === 'luopan_birthDate' || e.key === 'luopan_gender') { owner.birth = localStorage.getItem('luopan_birthDate') || owner.birth; owner.gender = localStorage.getItem('luopan_gender') || owner.gender; initSetup(); refresh(); }
});
let resizeTimer = null;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(draw, 120); });

// ---------- เริ่มทำงาน ----------
initSetup();
computeAll();
renderChips();
syncControls();
loadFloorImage();
