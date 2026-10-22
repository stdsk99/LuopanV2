// หน้าตรวจทิศเฟอร์นิเจอร์ (furniture.html) · สูตรใน js/furniture-core.js

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cn = (s) => s ? ` <span class="cn text-slate-400" style="font-size:.85em">${s}</span>` : '';
const norm = (d) => ((d % 360) + 360) % 360;
const RING = [1, 2, 5, 8, 7, 6, 3, 0];
const V_STYLE = { good: 'background:#064e3b;color:#a7f3d0', warn: 'background:#713f12;color:#fde68a', bad: 'background:#4c0519;color:#fecdd3' };
const V_TEXT = { good: '✅ ดี', warn: '⚠️ พอใช้', bad: '❌ ควรแก้' };
const R_ICON = { ok: '<span class="text-emerald-400 font-bold">✓</span>', warn: '<span class="text-amber-300 font-bold">!</span>', bad: '<span class="text-rose-400 font-bold">✗</span>' };

let D = furnLoad(), SUM = null, EDIT = null, CUR = { facing: null, pal: null };
try { if (house) SUM = houseSummary(house.facing, housePeriod(), getExactPillars(new Date()).solarYear, simpleOwnerKua()); } catch (e) { SUM = null; }
if (!house) $('noHouse').classList.remove('hidden');
if (APP_MODE === 'pro') document.querySelector('a[data-back]').href = 'index.html';

// ---------- ปุ่มเพิ่มของ ----------
$('addGrid').innerHTML = Object.keys(FURN_TYPES).map(k => `<button type="button" class="add" data-add="${k}"><span>${FURN_TYPES[k].icon}</span><span>${FURN_TYPES[k].l}</span></button>`).join('');
$('addGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-add]'); if (b) openDlg({ type: b.dataset.add }); });

// ---------- ภาพหมุน: ทิศปัจจุบัน (เทา) → ทิศแนะนำ (เขียว) ----------
function turnSvg(from, to) {
    const P = (r, b) => [50 + r * Math.sin(b * Math.PI / 180), 50 - r * Math.cos(b * Math.PI / 180)];
    const [fx, fy] = P(34, from), [tx, ty] = P(34, to);
    const turn = ((to - from + 540) % 360) - 180, sweep = turn > 0 ? 1 : 0;
    const [ax, ay] = P(42, from), [bx, by] = P(42, to);
    return `<svg width="84" height="84" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#0b1220" stroke="#334155"/>
        ${['N', 'E', 'S', 'W'].map((t, i) => { const [x, y] = P(38, i * 90); return `<text x="${x}" y="${y}" font-size="9" fill="#64748b" text-anchor="middle" dominant-baseline="central">${t}</text>`; }).join('')}
        <path d="M${ax},${ay} A42,42 0 0 ${sweep} ${bx},${by}" fill="none" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4 3"/>
        <line x1="50" y1="50" x2="${fx}" y2="${fy}" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="${tx}" y2="${ty}" stroke="#22c55e" stroke-width="5" stroke-linecap="round"/><circle cx="${tx}" cy="${ty}" r="5" fill="#22c55e"/><circle cx="50" cy="50" r="4" fill="#e2e8f0"/></svg>`;
}

// ---------- รายการผล ----------
function render() {
    const members = furnMembers(D);
    const order = { bad: 0, warn: 1, good: 2 };
    const list = D.items.map(it => ({ it, r: furnEval(it, members, SUM) })).sort((a, b) => order[a.r.verdict] - order[b.r.verdict]);
    $('items').innerHTML = list.map(({ it, r }) => {
        const T = FURN_TYPES[it.type], mem = members.find(m => m.id === it.member);
        const where = typeof it.pal === 'number' ? PERSON_DIR_TH[HOUSE_PALACES[it.pal]] : it.pal === 'C' ? 'กลางบ้าน' : '';
        const s = r.suggest;
        return `<article class="card p-3.5">
            <div class="flex items-center gap-2"><span class="text-2xl">${T.icon}</span>
                <div class="flex-1 min-w-0"><b class="text-white">${esc(it.name || T.l)}</b>${T.person && mem ? ` <span class="text-[12px] text-slate-400">· ${esc(mem.owner ? 'เจ้าของบ้าน' : mem.name)}</span>` : ''}
                <div class="text-[12px] text-slate-400">${typeof it.facing === 'number' ? `${T.face} ${PERSON_DIR_TH[furnDirCode(it.facing)]} ${it.facing.toFixed(1)}°` : ''}${where ? ` · อยู่${where}` : ''}</div></div>
                <span class="text-[12px] px-2.5 py-0.5 rounded-full" style="${V_STYLE[r.verdict]}">${V_TEXT[r.verdict]}</span></div>
            <ul class="mt-2 space-y-1 text-[13px]">${r.reasons.map(x => `<li class="flex gap-2"><span class="w-3 shrink-0">${R_ICON[x.k]}</span><span>${esc(x.t)}${cn(x.cn)}</span></li>`).join('')}</ul>
            ${s ? `<div class="mt-3 flex items-center gap-3 rounded-xl p-2.5" style="background:#052e1a;border:1px solid #166534">${turnSvg(it.facing, HOUSE_PALACES.indexOf(s.code) * 45)}
                <div class="text-[13px]"><b class="text-emerald-300">${s.turn === 0 ? 'ทิศนี้ใช้ได้' : `หมุน${s.turn > 0 ? 'ตามเข็มนาฬิกา' : 'ทวนเข็มนาฬิกา'} ประมาณ ${Math.abs(s.turn)}°`}</b>
                <div>ให้${T.face.replace('ไปทาง', '')}ไปทาง<b>${s.th}</b> = ทิศ${s.info.th}${cn(s.star)}</div><div class="text-[11px] text-slate-400 mt-0.5">${s.info.tip}</div>${s.top ? `<div class="text-[12px] text-sky-200 mt-1">ทิศที่ดีที่สุดสำหรับ${T.l}: <b>${PERSON_DIR_TH[s.top.code]}</b> (${PERSON_8M_INFO[s.top.star].th}${cn(s.top.star)}) หมุน${s.top.turn > 0 ? 'ตาม' : 'ทวน'}เข็ม ${Math.abs(s.top.turn)}°</div>` : ''}</div></div>` : ''}
            <div class="flex gap-2 mt-2.5"><button type="button" class="btn" data-edit="${it.id}">✏️ วัดใหม่/แก้ไข</button></div></article>`;
    }).join('') || '<p class="text-center text-slate-500 text-[13px] py-5">ยังไม่มีรายการ แตะของด้านบนเพื่อเริ่มตรวจ</p>';
    // คนในบ้าน
    $('members').innerHTML = members.map(m => {
        const row = PERSON_8M_TABLE[m.kua];
        const best = row ? `หัวเตียง: <b>${PERSON_DIR_TH[row[1]]}</b> หรือ ${PERSON_DIR_TH[row[2]]} · โต๊ะ: <b>${PERSON_DIR_TH[row[0]]}</b>` : (m.owner ? '<a href="home.html#setup" class="underline text-sky-300">ใส่วันเกิดเจ้าของบ้าน</a>' : 'ไม่มีวันเกิด');
        return `<div class="flex items-start gap-2 rounded-xl bg-slate-950/60 border border-slate-800 p-2.5 text-[13px]">
            <div class="flex-1"><b class="text-white">${esc(m.name)}</b>${m.kua ? ` <span class="text-[11px] text-slate-400">Kua ${m.kua}${cn(PERSON_KUA_TRIGRAM[m.kua])}</span>` : ''}<div class="text-[12px] text-slate-300 mt-0.5">${best}</div></div>
            ${m.owner ? '' : `<button type="button" class="text-[12px] text-rose-300" data-delmem="${m.id}">ลบ</button>`}</div>`;
    }).join('');
}
$('items').addEventListener('click', (e) => { const b = e.target.closest('[data-edit]'); if (b) openDlg(D.items.find(i => i.id === b.dataset.edit)); });
$('members').addEventListener('click', (e) => {
    const b = e.target.closest('[data-delmem]'); if (!b) return;
    D.members = D.members.filter(m => m.id !== b.dataset.delmem);
    D.items.forEach(i => { if (i.member === b.dataset.delmem) i.member = 'owner'; });
    furnSave(D); render();
});
$('mAdd').addEventListener('click', () => {
    const name = $('mName').value.trim(); if (!name) { $('mName').focus(); return; }
    D.members.push({ id: 'm' + Date.now().toString(36), name, birth: $('mBirth').value ? $('mBirth').value + 'T12:00' : null, gender: $('mGender').value });
    furnSave(D); $('mName').value = ''; $('mBirth').value = ''; render();
});

// ---------- หน้าต่างวัด ----------
function showFacing() {
    if (CUR.facing === null) { $('dDeg').textContent = '—'; $('dDir').textContent = ''; return; }
    $('dDeg').textContent = CUR.facing.toFixed(1) + '°';
    const code = furnDirCode(CUR.facing), mem = furnMembers(D).find(m => m.id === $('dMem').value) || furnMembers(D)[0];
    const T = FURN_TYPES[EDIT.type], kua = T.person ? mem.kua : furnMembers(D)[0].kua, e8 = kua ? personStarOf(code, kua) : null;
    $('dDir').innerHTML = `ทิศ${PERSON_DIR_TH[code]}${e8 ? ` · <span class="${e8.good ? 'text-emerald-300' : 'text-rose-300'}">${e8.good ? 'ดี' : 'ไม่ดี'} (${e8.c})</span>` : ''}`;
}
function renderGrid() {
    const fp = SUM ? SUM.ch.f.palace : 0, cellPal = new Array(9).fill('C');
    RING.forEach((g, k) => { cellPal[g] = (fp + k) % 8; });
    $('dGrid').innerHTML = cellPal.map(p => `<button type="button" class="pal" data-pal="${p}" aria-pressed="${String(CUR.pal === p)}" ${!SUM ? 'disabled style="opacity:.4"' : ''}>${p === 'C' ? 'กลางบ้าน' : PERSON_DIR_TH[HOUSE_PALACES[p]]}</button>`).join('');
}
$('dGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-pal]'); if (!b) return; CUR.pal = b.dataset.pal === 'C' ? 'C' : +b.dataset.pal; renderGrid(); });
$('dNoLoc').addEventListener('click', () => { CUR.pal = null; renderGrid(); });
function openDlg(item) {
    EDIT = item.id ? item : { id: null, type: item.type, member: 'owner' };
    const T = FURN_TYPES[EDIT.type];
    CUR = { facing: typeof EDIT.facing === 'number' ? EDIT.facing : null, pal: EDIT.pal === undefined ? null : EDIT.pal };
    $('dIcon').textContent = T.icon; $('dTitle').textContent = (item.id ? 'แก้ไข' : 'ตรวจ') + T.l;
    $('dName').value = EDIT.name || ''; $('dName').placeholder = T.l;
    $('dMemWrap').style.display = T.person ? '' : 'none';
    $('dMem').innerHTML = furnMembers(D).map(m => `<option value="${m.id}">${esc(m.name)}${m.kua ? '' : ' (ไม่มีวันเกิด)'}</option>`).join('');
    $('dMem').value = EDIT.member || 'owner';
    $('dFaceWrap').style.display = T.face ? '' : 'none';
    $('dFaceLabel').textContent = T.face || ''; $('dHow').textContent = T.how;
    $('dLocLabel').textContent = T.loc + 'อยู่ส่วนไหนของบ้าน';
    $('dManual').value = CUR.facing !== null ? CUR.facing : '';
    $('dDel').style.display = item.id ? '' : 'none';
    $('dMsg').textContent = '';
    showFacing(); renderGrid();
    $('dlg').showModal();
}
$('dMem').addEventListener('change', showFacing);
$('dManual').addEventListener('input', () => { const v = parseFloat($('dManual').value); if (!isNaN(v)) { sensorStop(); CUR.facing = norm(v); showFacing(); } });
$('dCancel').addEventListener('click', () => { sensorStop(); $('dlg').close(); });
$('dDel').addEventListener('click', () => { if (!confirm('ลบรายการนี้?')) return; D.items = D.items.filter(i => i.id !== EDIT.id); furnSave(D); sensorStop(); $('dlg').close(); render(); });
$('dSave').addEventListener('click', () => {
    const T = FURN_TYPES[EDIT.type];
    if (T.face && CUR.facing === null && CUR.pal === null) { $('dMsg').textContent = 'วัดทิศ หรือเลือกตำแหน่งอย่างน้อย 1 อย่าง'; return; }
    if (!T.face && CUR.pal === null) { $('dMsg').textContent = 'เลือกตำแหน่งในบ้าน'; $('dFaceWrap').style.display = ''; return; }
    sensorStop();
    const rec = { id: EDIT.id || 'f' + Date.now().toString(36), type: EDIT.type, name: $('dName').value.trim(), member: T.person ? $('dMem').value : undefined, facing: CUR.facing === null ? undefined : Math.round(CUR.facing * 10) / 10, pal: CUR.pal === null ? undefined : CUR.pal };
    const i = D.items.findIndex(x => x.id === rec.id);
    if (i >= 0) D.items[i] = rec; else D.items.push(rec);
    if (!furnSave(D)) alert('บันทึกไม่ได้ พื้นที่เก็บข้อมูลเต็ม');
    $('dlg').close(); render();
});

// ---------- เข็มทิศ (แบบเดียวกับหน้าหล่อแก) ----------
let sActive = false, sGotAbs = false, sSensor = null, sLast = 0;
const screenAngle = () => (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (typeof window.orientation === 'number' ? window.orientation : 0);
function sSet(hd) {
    const v = norm(hd + screenAngle() + northOffset());
    CUR.facing = CUR.facing === null ? v : norm(CUR.facing + ((((v - CUR.facing + 540) % 360) - 180) * 0.25));
    sLast = Date.now(); showFacing(); $('dManual').value = '';
}
function sOrient(e) {
    if (!sActive) return;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) return sSet(e.webkitCompassHeading);
    if (e.type === 'deviceorientationabsolute') { if (e.alpha == null) return; sGotAbs = true; return sSet(360 - e.alpha); }
    if (e.absolute === true && !sGotAbs && e.alpha != null) sSet(360 - e.alpha);
}
async function sensorStart() {
    if (window.isSecureContext === false || typeof DeviceOrientationEvent === 'undefined') { $('dMsg').textContent = 'เครื่องนี้ใช้เข็มทิศไม่ได้ พิมพ์องศาแทน'; return; }
    if (typeof DeviceOrientationEvent.requestPermission === 'function') { try { if (await DeviceOrientationEvent.requestPermission() !== 'granted') { $('dMsg').textContent = 'ต้องอนุญาตให้เข้าถึงเข็มทิศ'; return; } } catch (e) {} }
    sActive = true; sGotAbs = false;
    window.addEventListener('deviceorientationabsolute', sOrient); window.addEventListener('deviceorientation', sOrient);
    if ('AbsoluteOrientationSensor' in window) {
        try {
            sSensor = new AbsoluteOrientationSensor({ frequency: 30, referenceFrame: 'device' });
            sSensor.addEventListener('reading', () => { if (!sActive || sGotAbs || !sSensor.quaternion) return; const [x, y, z, w] = sSensor.quaternion; const ea = 2 * (x * y - z * w), no = 1 - 2 * (x * x + z * z); if (Math.hypot(ea, no) < 0.2) return; sSet(Math.atan2(ea, no) * 180 / Math.PI); });
            sSensor.addEventListener('error', () => { sSensor = null; }); sSensor.start();
        } catch (e) { sSensor = null; }
    }
    $('dSensor').textContent = '■ หยุด (ล็อกค่า)'; $('dSensor').style.background = '#dc2626';
    $('dMsg').textContent = 'ถือเครื่องแนวราบ รอตัวเลขนิ่ง แล้วกดหยุดเพื่อล็อกค่า';
    const t0 = Date.now(); setTimeout(() => { if (sActive && sLast < t0) $('dMsg').textContent = 'ยังไม่ได้ค่าทิศ ลองหมุนเครื่องเป็นเลข 8 หรือพิมพ์องศา'; }, 3000);
}
function sensorStop() {
    if (!sActive) return;
    sActive = false;
    window.removeEventListener('deviceorientationabsolute', sOrient); window.removeEventListener('deviceorientation', sOrient);
    if (sSensor) { try { sSensor.stop(); } catch (e) {} sSensor = null; }
    $('dSensor').textContent = '▶ ใช้เข็มทิศ'; $('dSensor').style.background = '#4f46e5';
    if (CUR.facing !== null) $('dMsg').textContent = 'ล็อกค่าแล้ว';
}
$('dSensor').addEventListener('click', () => sActive ? sensorStop() : sensorStart());

render();
if (!D.items.length && furnMembers(D).length) $('memBox').open = !furnMembers(D)[0].kua;
