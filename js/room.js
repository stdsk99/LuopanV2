// หน้าผังรายห้อง (room.html) · สูตรใน js/room-core.js · ห้องเก็บใน luopan_furniture.rooms (ต่อบ้าน)

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cn = (s) => s ? ` <span class="cn text-slate-400" style="font-size:.85em">${s}</span>` : '';
const RING = [1, 2, 5, 8, 7, 6, 3, 0];
const DIR = ['เหนือ', 'อีสาน', 'ตะวันออก', 'อาคเนย์', 'ใต้', 'หรดี', 'ตะวันตก', 'พายัพ'];
const TRI = ['坎', '艮', '震', '巽', '離', '坤', '兌', '乾'];
const JOB_COLOR = { bed: '#065f46', desk: '#1e3a8a', seat: '#065f46', cash: '#78350f', water: '#0c4a6e', fix: '#4c0519', store: '#334155' };

let D = furnLoad(), CH = null, SEL = null, LIVE = null, LABEL = () => '';
if (APP_MODE === 'pro') document.querySelector('a[data-back]').href = 'index.html';
if (!house) $('noHouse').classList.remove('hidden');
else {
    const y = getExactPillars(new Date()).solarYear;
    CH = houseChart(house.facing, housePeriod(), wrap9((2000 - y) % 9), houseCurrentPeriod(y));
}
const saveD = () => { if (!furnSave(D)) alert('บันทึกไม่ได้ พื้นที่เก็บข้อมูลเต็ม'); };

function renderBar() {
    $('roomBar').innerHTML = D.rooms.map(r => `<button type="button" class="chip" data-room="${r.id}" aria-pressed="${String(r.id === SEL)}">${ROOM_TYPES[r.type].icon} ${esc(r.name)}</button>`).join('')
        + `<button type="button" class="chip" id="addRoom" style="border-style:dashed">＋ เพิ่มห้อง</button>`;
}
$('roomBar').addEventListener('click', (e) => {
    if (e.target.closest('#addRoom')) {
        const r = { id: 'r' + Date.now().toString(36), name: 'ห้องนอน ' + (D.rooms.length + 1), type: 'bed', member: 'owner', door: null };
        D.rooms.push(r); saveD(); SEL = r.id; renderAll(); return;
    }
    const b = e.target.closest('[data-room]'); if (b) { SEL = b.dataset.room; renderAll(); }
});

function renderDetail() {
    const r = D.rooms.find(x => x.id === SEL);
    if (!r) { $('detail').innerHTML = D.rooms.length ? '' : `<section class="card p-5 text-center text-[13px] text-slate-300">ยังไม่มีห้อง กด "＋ เพิ่มห้อง" เพื่อเริ่ม</section>`; return; }
    const members = furnMembers(D), mem = members.find(m => m.id === r.member) || members[0];
    const A = CH ? roomAnalyze(r, CH, mem.kua) : null;
    // ตั้งค่าห้อง
    let h = `<section class="card p-4 space-y-3 text-[13px]">
        <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><input id="rName" class="fld" value="${esc(r.name)}" aria-label="ชื่อห้อง"><button type="button" class="btn" id="rDel" style="color:#fda4af">ลบห้อง</button></div>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="ประเภทห้อง">${Object.keys(ROOM_TYPES).map(k => `<button type="button" class="chip" data-type="${k}" aria-pressed="${String(r.type === k)}">${ROOM_TYPES[k].icon} ${ROOM_TYPES[k].l}</button>`).join('')}</div>
        <label class="block">ใครใช้ห้องนี้<select id="rMem" class="fld mt-1">${members.map(m => `<option value="${m.id}" ${m.id === mem.id ? 'selected' : ''}>${esc(m.name)}${m.kua ? '' : ' (ไม่มีวันเกิด)'}</option>`).join('')}</select></label>
        <div><div class="font-semibold">ประตูห้องอยู่ทิศไหน <span class="text-slate-400 font-normal">(มองจากกลางห้อง)</span></div>
            <div class="grid grid-cols-4 gap-1.5 mt-1.5">${DIR.map((d, p) => `<button type="button" class="chip" data-door="${p}" aria-pressed="${String(r.door === p)}">${d}</button>`).join('')}</div>
            <button type="button" id="rMeasure" class="btn mt-2 w-full" style="background:#312e81;border-color:#4f46e5">🧭 ยืนกลางห้อง หันหัวเครื่องไปที่ประตู แล้วกด</button>
            <div id="rMsg" class="text-[12px] text-amber-300 mt-1 min-h-[1em]"></div></div>
    </section>`;
    if (!A) { $('detail').innerHTML = h; bindDetail(r); return; }
    // ผัง 3×3 ประตูอยู่ล่าง
    const door = r.door === null || r.door === undefined ? CH.f.palace : r.door;
    const cellPal = new Array(9).fill('C'); RING.forEach((g, k) => { cellPal[g] = (door + k - 4 + 8) % 8; });
    const jobsAt = (p) => A.picks.filter(x => x.cells.some(c => c.p === p)).map(x => x.job);
    const avoidAt = (p) => A.picks.filter(x => x.avoid.includes(p)).map(x => x.job);
    LABEL = (p) => { const js = jobsAt(p); return js.length ? 'มุมนี้: ' + js.map(j => ROOM_JOB[j].l).join(' · ') : (avoidAt(p).length ? 'มุมนี้ไม่ควรวาง' + avoidAt(p).map(j => ROOM_JOB[j].l.replace('ตำแหน่ง', '')).join('/') : 'มุมนี้ใช้งานปกติ'); };
    h += `<section class="card p-4" aria-labelledby="hGrid"><div class="flex items-baseline justify-between"><h2 id="hGrid" class="font-bold text-yellow-300">${ROOM_TYPES[r.type].icon} ${esc(r.name)}</h2><span class="text-[11px] text-slate-400">${r.door === null || r.door === undefined ? 'ยังไม่ได้ตั้งประตู (ใช้หน้าบ้าน)' : 'ประตูห้องอยู่ด้านล่าง'}</span></div>
        <div id="grid" class="grid grid-cols-3 gap-1.5 mt-3">${cellPal.map(p => {
            if (p === 'C') return `<div class="cell flex flex-col items-center justify-center"><b class="text-[12px]">กลางห้อง</b><span class="text-[11px] text-slate-400">ยืนตรงนี้</span></div>`;
            const js = jobsAt(p), av = avoidAt(p), c = A.cells[p], bg = js.length ? JOB_COLOR[js[0]] : '#0b1220';
            return `<div class="cell" data-p="${p}" style="background:${bg}"><b class="text-[12.5px]">${DIR[p]}</b>${cn(TRI[p])}
                <div class="text-[20px] leading-tight mt-0.5">${js.map(j => ROOM_JOB[j].icon).join(' ') || (av.length ? '🚫' : '·')}</div>
                <div class="text-[10.5px] text-slate-300">${js.map(j => ROOM_JOB[j].l.replace('ตำแหน่ง', '')).join(' · ') || (av.length ? 'ไม่ควรวาง' + av.map(j => ROOM_JOB[j].l.replace('ตำแหน่ง', '')).join('/') : '')}</div>
                ${APP_MODE === 'pro' ? `<div class="absolute right-1.5 top-1 text-[10px] font-mono"><span class="text-amber-300">${c.m}</span> <span class="text-sky-300">${c.f}</span></div>` : ''}</div>`;
        }).join('')}</div>
        <div class="text-center text-[11px] text-slate-400 mt-1">▼ ประตูห้อง</div>
        <button type="button" id="liveBtn" class="btn w-full mt-2">🧭 ${LIVE ? 'หยุด' : 'ชี้มือถือ แล้วไฮไลต์มุมที่ชี้'}</button>
        <div id="liveTxt" class="text-[12.5px] text-center text-sky-200 mt-1 min-h-[1em]"></div>
    </section>`;
    // คำแนะนำ
    const remFor = { water: [{ i: 'fountain', l: 'น้ำพุ' }, { i: 'aquarium', l: 'ตู้ปลา' }], fix: null };
    h += `<section class="card p-4" aria-labelledby="hRec"><h2 id="hRec" class="font-bold text-emerald-300">👉 จัดห้องนี้อย่างไร</h2><div class="mt-2 divide-y divide-slate-800">${A.picks.map(x => {
        const j = ROOM_JOB[x.job];
        const items = x.job === 'water' ? remFor.water : x.job === 'fix' ? x.cells.map(c => { const cc = A.cells[c.p]; return (cc.a2 || cc.m === 2 || cc.f === 2) && !cc.bad5 && !cc.a5 ? { i: 'gourd', l: 'น้ำเต้าทองเหลือง' } : { i: 'windchime', l: 'กระดิ่งลมทองเหลือง' }; }) : [];
        return `<div class="py-2.5 flex gap-3"><span class="text-2xl">${j.icon}</span><div class="min-w-0 flex-1"><b class="text-white">${j.l}: ${x.cells.map(c => 'มุม' + DIR[c.p]).join(', ')}</b>
            <div class="text-[12.5px] text-slate-400">${x.cells.map(c => c.why.join(' · ')).filter(Boolean).join(' | ')}</div>
            ${items.length ? `<div class="flex flex-wrap gap-1.5 mt-1.5">${items.filter((it, i, arr) => arr.findIndex(z => z.i === it.i) === i).map(it => remedyChip(it, 24)).join('')}</div>` : ''}
            ${x.avoid.length ? `<div class="text-[12px] text-rose-300 mt-0.5">ไม่ควรวางมุม${DIR[x.avoid[0]]}</div>` : ''}</div></div>`;
    }).join('')}</div>
    ${A.facing && (ROOM_TYPES[r.type].jobs.includes('bed') || ROOM_TYPES[r.type].jobs.includes('desk')) ? `<div class="mt-2 rounded-xl p-3 text-[13px]" style="background:#052e1a;border:1px solid #166534">
        ${ROOM_TYPES[r.type].jobs.includes('bed') ? `🛏️ หันหัวเตียงไปทาง <b>${PERSON_DIR_TH[A.facing.bed[0]]}</b> หรือ ${PERSON_DIR_TH[A.facing.bed[1]]}<br>` : ''}
        ${ROOM_TYPES[r.type].jobs.includes('desk') ? `💻 นั่งหันหน้าไปทาง <b>${PERSON_DIR_TH[A.facing.desk[0]]}</b> หรือ ${PERSON_DIR_TH[A.facing.desk[1]]}<br>` : ''}
        <a href="furniture.html" class="text-sky-300 underline text-[12px]">วัดทิศจริงด้วยหน้าตรวจเฟอร์นิเจอร์ →</a></div>` : (mem.kua ? '' : `<p class="text-[12px] text-amber-200 mt-2">ใส่วันเกิดของ${esc(mem.name)}เพื่อดูทิศหัวเตียง/โต๊ะที่ดี (<a href="furniture.html" class="underline">เพิ่มคนในบ้าน</a>)</p>`)}
    <p class="text-[11px] text-slate-500 mt-2">ทิศในห้องนับจากจุดกลางห้อง ใช้ดาวเหินชุดเดียวกับทั้งบ้าน · มุมที่แนะนำเลือกจากคะแนนของแอป</p></section>`;
    $('detail').innerHTML = h;
    bindDetail(r);
}
function bindDetail(r) {
    $('rName').addEventListener('change', () => { r.name = $('rName').value.trim() || r.name; saveD(); renderBar(); renderDetail(); });
    $('rDel').addEventListener('click', () => { if (!confirm(`ลบ "${r.name}"?`)) return; D.rooms = D.rooms.filter(x => x.id !== r.id); saveD(); SEL = D.rooms[0] ? D.rooms[0].id : null; renderAll(); });
    $('rMem').addEventListener('change', () => { r.member = $('rMem').value; saveD(); renderDetail(); });
    $('detail').querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { r.type = b.dataset.type; saveD(); renderAll(); }));
    $('detail').querySelectorAll('[data-door]').forEach(b => b.addEventListener('click', () => { r.door = +b.dataset.door; saveD(); renderDetail(); }));
    $('rMeasure').addEventListener('click', async () => {
        $('rMsg').textContent = 'กำลังอ่านเข็มทิศ… ถือเครื่องนิ่ง ๆ';
        let got = [];
        const ok = await headingStart((d) => { got.push(d); }, (m) => { $('rMsg').textContent = m; });
        if (!ok) return;
        setTimeout(() => {
            headingStop();
            if (!got.length) { $('rMsg').textContent = 'ไม่ได้ค่าทิศ แตะเลือกทิศประตูเองด้านบน'; return; }
            // ค่าเฉลี่ยแบบวงกลม
            const sx = got.reduce((s, d) => s + Math.sin(d * Math.PI / 180), 0), cx = got.reduce((s, d) => s + Math.cos(d * Math.PI / 180), 0);
            const deg = ((Math.atan2(sx, cx) * 180 / Math.PI) + 360) % 360;
            r.door = houseMountainOf(deg).palace; saveD(); renderDetail();
            $('rMsg').textContent = `ประตูอยู่ทิศ${DIR[r.door]} (${deg.toFixed(0)}°)`;
        }, 2500);
    });
    const lb = $('liveBtn');
    if (lb) lb.addEventListener('click', async () => {
        if (LIVE) { headingStop(); LIVE = null; renderDetail(); return; }
        LIVE = true; lb.textContent = '🧭 หยุด';
        await headingStart((d) => {
            const p = houseMountainOf(d).palace;
            document.querySelectorAll('#grid [data-p]').forEach(el => el.classList.toggle('hl', +el.dataset.p === p));
            $('liveTxt').textContent = `หัวเครื่องชี้ทิศ${DIR[p]} ${d.toFixed(0)}° · ${LABEL(p)}`;
        }, (m) => { $('liveTxt').textContent = m; });
    });
}
function renderAll() { if (!SEL && D.rooms[0]) SEL = D.rooms[0].id; renderBar(); renderDetail(); }
if (!D.rooms.length && house) { D.rooms.push({ id: 'r' + Date.now().toString(36), name: 'ห้องนอนใหญ่', type: 'bed', member: 'owner', door: null }); saveD(); }
renderAll();
