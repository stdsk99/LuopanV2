// หน้าจุดวางน้ำและประตู (water.html) · สูตรใน js/water-core.js และ houseGates ใน js/fs-core.js

const $ = (id) => document.getElementById(id);
const cn = (s) => s ? ` <span class="cn text-slate-400" style="font-size:.85em">${s}</span>` : '';
const norm = (d) => ((d % 360) + 360) % 360;
let VIEW = 'front', HEAD = null, SHOWN = null;
const PERSON_DIR_TH_LOCAL = ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'];

if (!house) {
    $('content').innerHTML = `<section class="card p-5 text-center text-[14px]">ยังไม่ได้บันทึกทิศบ้าน<br><a href="home.html" class="inline-block mt-3 text-sky-300 underline">ใส่ข้อมูลบ้านก่อน →</a></section>`;
} else {
    // ปีฮวงจุ้ยเปลี่ยนที่เวลา 立春 จริง (ตรงกับ APK และหน้าอื่น)
    const fy = getExactPillars(new Date()).solarYear;
    const ch = houseChart(house.facing, housePeriod(), wrap9((2000 - fy) % 9), houseCurrentPeriod(fy));
    const G = houseWaterGuide(ch, house.facing);
    render(ch, G);
}

function dialSvg(ch, G) {
    const P = (r, b) => { const a = b * Math.PI / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };
    const wedge = (r0, r1, b0, b1, fill, stroke) => { const [x0, y0] = P(r1, b0), [x1, y1] = P(r1, b1), [x2, y2] = P(r0, b1), [x3, y3] = P(r0, b0), L = (b1 - b0) > 180 ? 1 : 0; return `<path d="M${x0},${y0} A${r1},${r1} 0 ${L} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${L} 0 ${x3},${y3}Z" fill="${fill}" stroke="${stroke || '#334155'}" stroke-width="1"/>`; };
    const txt = (r, b, s, size, fill, w, cls) => { const [x, y] = P(r, b); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" fill="${fill}" font-weight="${w || 600}" text-anchor="middle" dominant-baseline="central" transform="rotate(${b} ${x.toFixed(1)} ${y.toFixed(1)})" class="${cls || ''}">${s}</text>`; };
    let h = '<circle r="198" fill="#0b1220" stroke="#a16207" stroke-width="3"/>';
    const gateM = G.gates.map(g => g.m);
    for (let i = 0; i < 24; i++) {
        const c = i * 15 - 15, isGate = gateM.includes(i);
        h += wedge(150, 196, c - 7.5, c + 7.5, isGate ? 'rgba(234,179,8,0.45)' : (i === ch.f.m ? 'rgba(239,68,68,0.3)' : 'transparent'), '#475569');
        h += txt(178, c, HOUSE_M24[i], 16, '#f8fafc', 700, 'cn');
        if (isGate) h += txt(160, c, '門 ประตูเมือง', 8.5, '#fde047', 700);
        else h += txt(160, c, HOUSE_M24_TH[i], 9, '#94a3b8', 500);
    }
    if (!G.rb.none) {
        h += wedge(146, 150, G.rb.water.a, G.rb.water.b, '#22d3ee', 'none');
        h += wedge(146, 150, G.rb.dragon.a, G.rb.dragon.b, '#4ade80', 'none');
    }
    G.rows.forEach(r => {
        const c = r.p * 45, w = r.water, m = r.mount;
        const kind = w > 0 && w >= m ? 'w' : m > 0 ? 'm' : '';
        const fill = kind === 'w' ? `rgba(59,130,246,${Math.min(0.75, 0.18 + w * 0.09)})` : kind === 'm' ? `rgba(180,83,9,${Math.min(0.75, 0.18 + m * 0.09)})` : 'rgba(51,65,85,0.35)';
        h += wedge(62, 145, c - 22.5, c + 22.5, fill, '#475569');
        h += txt(128, c, HOUSE_PALACE_SHORT[r.p], 14, '#ffffff', 700);
        if (w > 0 && m > 0) h += txt(106, c, `💧${'●'.repeat(Math.min(4, w))} ⛰️${'●'.repeat(Math.min(4, m))}`, 9.5, '#e2e8f0', 600); else
        h += txt(106, c, kind === 'w' ? `💧 น้ำ/ประตู ${'●'.repeat(Math.min(5, w))}` : kind === 'm' ? `⛰️ สูง/ทึบ ${'●'.repeat(Math.min(5, m))}` : 'ปกติ', 10, kind === 'w' ? '#bfdbfe' : kind === 'm' ? '#fde68a' : '#94a3b8', 600);
        if (r.warn.length) h += txt(85, c, '⚠️', 12, '#fff', 400);
    });
    h += '<circle r="60" fill="#0f172a" stroke="#475569"/>';
    const [fx, fy] = P(203, norm(house.facing)); h += `<circle cx="${fx}" cy="${fy}" r="5" fill="#ef4444"/>`;
    return `<svg viewBox="-205 -205 410 410" width="100%" height="100%" role="img" aria-label="จานจุดวางน้ำและที่สูง"><g id="rot">${h}</g>
        <text y="-6" font-size="12" fill="#facc15" font-weight="700" text-anchor="middle" id="midT">▲ หน้าบ้าน</text><text y="12" font-size="9.5" fill="#94a3b8" text-anchor="middle">ยุค ${ch.C}</text></svg>`;
}

function itemHtml(r, kind) {
    const list = kind === 'w' ? r.wr : r.mr, score = kind === 'w' ? r.water : r.mount;
    const items = kind === 'w' ? [{ i: 'fountain', l: 'น้ำพุ' }, { i: 'aquarium', l: 'ตู้ปลา' }] : [{ i: 'crystal', l: 'หิน/คริสตัล' }, { i: 'cabinet', l: 'ตู้/ของหนัก' }];
    const what = kind === 'w' ? 'ประตูรอง ทางเดิน หน้าต่างเปิดรับลม หรือวางน้ำเคลื่อนไหว (นอกบ้าน: บ่อ ถนน ที่โล่ง)' : 'ผนังทึบ ตู้สูง ชั้นหนังสือ หรือหัวเตียง (นอกบ้าน: ตึก ต้นไม้ใหญ่ เนิน)';
    return `<div class="rounded-xl bg-slate-950/60 border ${kind === 'w' ? 'border-blue-900' : 'border-amber-900'} p-3">
        <div class="flex items-center gap-2"><b class="text-white text-[15px]">ทิศ${PERSON_DIR_TH_LOCAL[r.p]}</b>${cn(['坎', '艮', '震', '巽', '離', '坤', '兌', '乾'][r.p])}
            <span class="ml-auto text-[12px] ${kind === 'w' ? 'text-blue-300' : 'text-amber-300'}">${'●'.repeat(Math.min(5, score))}</span></div>
        <ul class="mt-1.5 space-y-0.5 text-[12.5px] text-slate-300">${list.map(x => `<li>✓ ${x.t}${cn(x.cn)}</li>`).join('')}</ul>
        <div class="text-[12.5px] text-slate-200 mt-1.5">ทำ: ${what}</div>
        <div class="flex flex-wrap gap-1.5 mt-2">${items.map(it => remedyChip(it, 24)).join('')}</div>
        ${r.both ? `<div class="text-[12px] text-sky-200 mt-1.5">ℹ️ ${r.both}</div>` : ''}
        ${r.warn.length ? `<div class="text-[12px] text-rose-300 mt-1.5">⚠️ ${r.warn.join(' · ')}</div>` : ''}</div>`;
}

function render(ch, G) {
    const gateTxt = G.gates.length ? G.gates.map(g => `<b class="text-yellow-300">ทิศ${PERSON_DIR_TH_LOCAL[g.pal]}</b> ภูเขา <span class="cn">${HOUSE_M24[g.m]}</span> ${g.a.toFixed(1)}°–${g.b.toFixed(1)}°${G.rows[g.pal].warn.some(w => w.includes('ดาวน้ำ 5')) ? ' <span class="text-rose-300">(แต่ทิศนี้มีดาวน้ำ 5 ใช้เป็นทางเดินได้ ไม่ควรวางน้ำ)</span>' : ''}`).join(' และ ') : 'บ้านทิศนี้ในยุคนี้ไม่มีประตูเมืองที่ใช้ได้';
    $('content').innerHTML = `
        <div class="seg flex flex-wrap gap-1.5 justify-center" role="group" aria-label="มุมมองจาน">
            <button type="button" data-v="front" aria-pressed="true">หน้าบ้านอยู่บน</button>
            <button type="button" data-v="north" aria-pressed="false">เหนืออยู่บน</button>
            <button type="button" data-v="live" aria-pressed="false">🧭 หมุนตามเข็มทิศ</button>
        </div>
        <div id="dialWrap" class="mt-2">${dialSvg(ch, G)}<div id="needle" hidden></div></div>
        <div class="flex flex-wrap justify-center gap-3 text-[11px] text-slate-400"><span style="color:#93c5fd">■ น้ำ/ประตู</span><span style="color:#fbbf24">■ สูง/ทึบ</span><span style="color:#fde047">■ 門 ประตูเมือง</span><span style="color:#22d3ee">▬ น้ำขโมยโชค</span><span style="color:#4ade80">▬ มังกร</span><span style="color:#f87171">● หน้าบ้าน</span></div>
        <p id="liveMsg" class="text-center text-[12px] text-amber-300 min-h-[1em]"></p>
        <section class="card p-4" style="border-color:#a16207"><h2 class="font-bold text-yellow-300">🏯 ประตูเมือง <span class="cn text-[13px]">城門</span></h2>
            <p class="text-[13px] text-slate-300 mt-1">${gateTxt}</p>
            <p class="text-[12px] text-slate-400 mt-1">ประตูรอง ทางเข้า หรือน้ำในช่วงองศานี้ ดึงพลังของยุคเข้าบ้านได้ แม้ประตูหน้าจะไม่ดี เป็นวิธีแก้บ้านที่นิยมมาก</p></section>
        <section aria-labelledby="hW"><h2 id="hW" class="font-bold text-blue-300 px-1 mb-2">💧 ควรมีน้ำ ประตู หรือทางเดิน</h2>
            <div class="space-y-2">${G.water.map(r => itemHtml(r, 'w')).join('') || '<p class="text-[13px] text-slate-400 px-1">ไม่มีทิศที่เด่นชัด</p>'}</div></section>
        <section aria-labelledby="hM"><h2 id="hM" class="font-bold text-amber-300 px-1 mb-2">⛰️ ควรสูง ทึบ หรือมีของหนัก</h2>
            <div class="space-y-2">${G.mount.map(r => itemHtml(r, 'm')).join('') || '<p class="text-[13px] text-slate-400 px-1">ไม่มีทิศที่เด่นชัด</p>'}</div></section>
        <p class="text-[11px] text-slate-500 px-1">จำนวน ● คือน้ำหนักรวมจากหลายวิชา (แอปกำหนดเอง) · ทิศนับจากจุดกลางบ้าน · ประตูเมืองใช้สูตร 城門訣 ตรวจกับแอปดาวเหินแล้ว</p>`;
    document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => setView(b.dataset.v)));
    setView('front');
}
function applyRot(deg) {
    const g = document.getElementById('rot'); if (g) g.setAttribute('transform', `rotate(${(-deg).toFixed(2)})`);
}
function setView(v) {
    VIEW = v;
    document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    $('needle').hidden = v !== 'live';
    $('midT').textContent = v === 'front' ? '▲ หน้าบ้าน' : v === 'north' ? '▲ เหนือ' : '▲ ทิศที่หัวเครื่องชี้';
    if (v !== 'live') { headingStop(); $('liveMsg').textContent = ''; applyRot(v === 'front' ? house.facing : 0); return; }
    $('liveMsg').textContent = 'ถือเครื่องแนวราบ ยืนกลางบ้าน หันหัวเครื่องไปทางไหน จานจะบอกว่าทิศนั้นควรทำอะไร';
    headingStart((d) => { HEAD = d; }, (m) => { $('liveMsg').textContent = m; });
    const loop = () => {
        if (VIEW !== 'live') return;
        if (HEAD !== null) { SHOWN = SHOWN === null ? HEAD : norm(SHOWN + ((((HEAD - SHOWN + 540) % 360) - 180) * 0.18)); applyRot(SHOWN); }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}
