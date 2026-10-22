// หน้าบ้านของฉัน (home.html): สรุปผลบ้านแบบภาษาง่าย สำหรับโหมดผู้ใช้ทั่วไป
// สูตรอยู่ใน js/simple-core.js (ใช้ fs-core / fs-pairs / person-core / remedy-core ชุดเดียวกับโหมดมืออาชีพ)

const $ = (id) => document.getElementById(id);
const cn = (s) => s ? ` <span class="cn text-[0.8em] text-slate-400">${s}</span>` : '';
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- โหมด ----------
function renderModeSwitch() {
    const paint = (el, on) => { el.style.background = on ? '#eab308' : '#1e293b'; el.style.color = on ? '#0f172a' : '#cbd5e1'; el.style.fontWeight = on ? '600' : '400'; };
    paint($('modeSimple'), APP_MODE === 'simple');
    paint($('modePro'), APP_MODE === 'pro');
    $('modeSimple').setAttribute('aria-pressed', String(APP_MODE === 'simple'));
    $('modePro').setAttribute('aria-pressed', String(APP_MODE === 'pro'));
}
$('modeSimple').addEventListener('click', () => { if (APP_MODE !== 'simple') appModeGo('simple'); });
$('modePro').addEventListener('click', () => appModeGo('pro'));

// ---------- ข้อมูลเจ้าของบ้าน (ชุดเดียวกับหน้าอื่น) ----------
const ownerKua = simpleOwnerKua;

// ---------- ส่วนแสดงผล ----------
const starsHtml = (n) => {
    const full = Math.floor(n), half = n - full >= 0.5;
    let s = '';
    for (let i = 0; i < 5; i++) s += i < full ? '<span class="text-yellow-400">★</span>' : (i === full && half ? '<span class="star-half">★</span>' : '<span class="text-slate-700">★</span>');
    return `<div class="star" role="img" aria-label="${n} จาก 5 ดาว">${s}</div>`;
};
const remedyHtml = (rm) => rm ? `<span class="inline-flex flex-wrap gap-1.5 align-middle">${rm.items.map(it => remedyChip(it, 24)).join('')}</span>${rm.note ? ` <span class="text-red-300 text-[11px]">(${rm.note})</span>` : ''}` : '';
const dirName = (p) => `${SIMPLE_PAL_TH[p]}${cn(SIMPLE_TRIGRAM[p])}`;

// สถานะของแต่ละทิศสำหรับผังสี: good / bad / mid
const palState = simplePalState, palLabel = simplePalLabel;
const STATE_STYLE = {
    good: 'background:#064e3b;border-color:#10b981;color:#d1fae5',
    bad: 'background:#4c0519;border-color:#f43f5e;color:#ffe4e6',
    mid: 'background:#1e293b;border-color:#334155;color:#cbd5e1'
};
const STATE_ICON = { good: '✅', bad: '⚠️', mid: '◽' };
let SUM = null, SEL = null;   // ผลสรุปล่าสุด และทิศที่แตะเลือก

function detailHtml(p) {
    if (p === 'C') return `<b class="text-white">กลางบ้าน</b><div class="mt-1">รักษาให้สะอาด โปร่ง ไม่วางของหนักหรือห้องน้ำ</div>`;
    const x = SUM.pals[p], yb = SUM.yearBad.filter(y => y.p === p), yg = SUM.yearGood.filter(y => y.p === p);
    let h = `<b class="text-white text-[15px]">${dirName(p)}</b>`;
    if (x.good) h += `<div class="mt-2 text-emerald-300 font-semibold">✅ ${x.good.title}${cn(x.good.cn)}</div>
        <div>เหมาะเป็น: ${x.good.use.join(' · ')}</div>${x.good.boost ? `<div class="mt-1">เสริมด้วย: ${remedyHtml(x.good.boost)}</div>` : ''}`;
    x.bad.forEach(b => {
        h += `<div class="mt-2 text-rose-300 font-semibold">⚠️ ${esc(b.title)}${cn(b.cn)}</div>`;
        if (b.text) h += `<div>${esc(b.text)}</div>`;
        if (b.fix) h += `<div class="mt-1">แก้ด้วย: ${remedyHtml(b.fix)}</div>`;
        if (b.fixText) h += `<div class="mt-1">แก้ด้วย: ${esc(b.fixText)}</div>`;
        if (b.avoid) h += `<div class="text-amber-200/90">${esc(b.avoid)}</div>`;
    });
    yb.filter(y => !x.bad.some(b => b.cn === y.cn)).forEach(y => { h += `<div class="mt-2 text-orange-300">🗓️ ปีนี้: ${y.title}${cn(y.cn)}</div>`; });
    yg.forEach(y => { h += `<div class="mt-2 text-yellow-200">🗓️ ปีนี้เสริมโชค: ${y.title}${cn(y.cn)} · ${remedyHtml(y.fix)}</div>`; });
    if (!x.good && !x.bad.length && !yb.length && !yg.length) h += `<div class="mt-1">ทิศกลาง ๆ ใช้งานได้ตามปกติ</div>`;
    h += `<div class="text-[11px] text-slate-500 mt-2">ดาวน้ำ ${x.f} · ดาวภูเขา ${x.m} · ดาวจรปี ${x.a}</div>`;
    return h;
}
function selectPal(p) {
    SEL = p;
    document.querySelectorAll('#houseGrid [data-p]').forEach(el => { const on = el.dataset.p === String(p); el.style.outline = on ? '3px solid #facc15' : 'none'; el.setAttribute('aria-pressed', String(on)); });
    $('palDetail').innerHTML = detailHtml(p);
}

function renderSummary() {
    const box = $('summary');
    if (!house) {
        box.innerHTML = `<section class="card p-5 text-center">
            <div class="text-4xl mb-2">🏡</div>
            <h2 class="text-lg font-bold text-yellow-300">ดูฮวงจุ้ยบ้านของคุณใน 3 ขั้น</h2>
            <ol class="text-[13px] text-slate-300 mt-3 space-y-1 text-left inline-block">
                <li>1. วัดทิศหน้าบ้าน</li><li>2. ใส่ปีที่สร้างบ้าน</li><li>3. ดูผลและวิธีแก้</li>
            </ol>
            <p class="text-[12px] text-slate-400 mt-3">เริ่มที่ "ข้อมูลบ้าน" ด้านล่าง</p></section>
            <a href="compass.html" class="card p-3 flex items-center gap-3" style="border-color:#a16207"><span class="text-3xl">🧭</span><span class="flex-1"><b class="text-yellow-300">เปิดหล่อแก</b><span class="block text-[12px] text-slate-400">เข็มทิศ 3 มิติ ใช้วัดทิศหน้าบ้าน</span></span><span class="text-yellow-400">›</span></a>`;
        $('setup').open = true;
        return;
    }
    const year = getExactPillars(new Date()).solarYear;
    const s = SUM = houseSummary(house.facing, housePeriod(), year, ownerKua());
    const ch = s.ch, f = ch.f;
    // ---------- 1. ดาว ----------
    let h = `<section class="card p-4" aria-labelledby="hRate">
        <div class="text-[12px] text-slate-400">บ้านหัน${SIMPLE_PAL_TH[f.palace]}${cn(HOUSE_M24[f.m])} ${house.facing.toFixed(1)}° · สร้างยุค ${ch.P}</div>
        <div class="flex items-end gap-3 mt-1">${starsHtml(s.stars)}<h2 id="hRate" class="text-2xl font-bold text-white pb-0.5">${s.rating.th}</h2></div>
        <p class="text-[13px] text-slate-300 mt-1">${s.rating.t}</p>
        <details class="mt-2 text-[13px]"><summary class="cursor-pointer text-sky-300 text-[12px]">ทำไมได้ ${s.stars} ดาว</summary>
            <ul class="mt-2 space-y-1">${s.reasons.map(r => `<li class="flex gap-2"><span class="${r.ok ? 'text-emerald-400' : 'text-rose-400'} font-bold">${r.ok ? '✓' : '✗'}</span><span>${esc(r.t)}${cn(r.cn)}</span></li>`).join('')}</ul>
            ${ch.ti ? `<p class="text-[11px] text-slate-500 mt-2">ใช้ผังทดแทน${cn('替卦')} ตามตัวเลือก</p>` : ''}</details>
    </section>
    <a href="compass.html" class="card p-3 flex items-center gap-3 hover:border-yellow-600" style="border-color:#a16207">
        <span class="text-3xl">🧭</span><span class="flex-1"><b class="text-yellow-300">เปิดหล่อแก</b><span class="block text-[12px] text-slate-400">เข็มทิศ 3 มิติ ดูทิศรอบบ้านและวัดทิศหน้าบ้าน</span></span><span class="text-yellow-400">›</span></a>`;
    // ---------- 2. ผังบ้าน 9 ช่อง (หน้าบ้านอยู่ด้านบน) ----------
    const RING = [1, 2, 5, 8, 7, 6, 3, 0];
    const cellPal = new Array(9).fill('C');
    RING.forEach((g, k) => { cellPal[g] = (f.palace + k) % 8; });
    const tile = (g) => {
        const p = cellPal[g];
        if (p === 'C') return `<button type="button" data-p="C" class="rounded-xl border p-1.5 text-center" style="${STATE_STYLE.mid}"><div class="text-[12px] font-semibold">กลางบ้าน</div><div class="text-[11px] opacity-70">◽</div></button>`;
        const x = s.pals[p], st = palState(x);
        const lab = palLabel(x, st);
        const yr = s.yearBad.some(y => y.p === p && y.cn === '五黃') && !x.bad.some(b => b.cn === '五黃') ? ' · ห้ามเจาะ' : '';
        return `<button type="button" data-p="${p}" class="rounded-xl border p-1.5 text-center min-h-[64px]" style="${STATE_STYLE[st]}" aria-label="${SIMPLE_PAL_TH[p]} ${lab}">
            <div class="text-[12px] font-semibold leading-tight">${HOUSE_PALACE_SHORT[p]}${cn(SIMPLE_TRIGRAM[p])}</div>
            <div class="text-[12px] mt-0.5">${STATE_ICON[st]} ${lab}${yr}</div></button>`;
    };
    h += `<section class="card p-4" aria-labelledby="hMap">
        <div class="flex items-baseline justify-between"><h2 id="hMap" class="font-bold text-yellow-300">🧭 ผังบ้านของคุณ</h2><span class="text-[11px] text-slate-400">แตะช่องเพื่อดูวิธีแก้</span></div>
        <div class="text-center text-[11px] text-slate-400 mt-2">▲ หน้าบ้าน</div>
        <div id="houseGrid" class="grid grid-cols-3 gap-1.5 mt-1">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(tile).join('')}</div>
        <div class="flex justify-center gap-3 text-[11px] text-slate-400 mt-2"><span>✅ ดี</span><span>⚠️ ควรแก้</span><span>◽ ปกติ</span></div>
        <div id="palDetail" class="mt-3 rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-[13px] text-slate-300 leading-relaxed" aria-live="polite"></div>
    </section>`;
    // ---------- 3. ทำ 3 อย่างนี้ก่อน ----------
    const acts = [];
    const fixLabel = (b) => b.fix ? b.fix.items.map(i => i.l).join(' หรือ ') : (b.fixText || b.avoid || '');
    if (s.bads[0]) { const x = s.bads[0], b = x.bad[0]; acts.push({ i: '🛠️', p: x.p, t: `${SIMPLE_PAL_TH[x.p]}: ${b.title}`, d: fixLabel(b) }); }
    if (s.goods[0]) { const x = s.goods[0]; acts.push({ i: '✨', p: x.p, t: `${SIMPLE_PAL_TH[x.p]}: ${x.good.title}`, d: `ใช้เป็น${x.good.useShort}` }); }
    const y5 = s.yearBad.find(y => y.cn === '五黃');
    if (y5 && !acts.some(a => a.p === y5.p)) acts.push({ i: '🗓️', p: y5.p, t: `ปีนี้${SIMPLE_PAL_TH[y5.p]}: ห้ามซ่อม เจาะ ทุบ`, d: 'แขวนกระดิ่งลมทองเหลือง' });
    else if (s.bads[1]) { const x = s.bads[1], b = x.bad[0]; acts.push({ i: '🛠️', p: x.p, t: `${SIMPLE_PAL_TH[x.p]}: ${b.title}`, d: fixLabel(b) }); }
    h += `<section class="card p-4" aria-labelledby="hAct">
        <h2 id="hAct" class="font-bold text-emerald-300">👉 ทำ 3 อย่างนี้ก่อน</h2>
        <ol class="mt-2 space-y-2">${acts.map((a, i) => `<li><button type="button" data-goto="${a.p}" class="w-full text-left flex gap-3 rounded-xl bg-slate-950/60 border border-slate-800 p-3 hover:border-yellow-600">
            <span class="text-xl leading-none">${a.i}</span><span class="min-w-0"><b class="text-white text-[14px]">${i + 1}. ${esc(a.t)}</b><span class="block text-[12px] text-slate-400 mt-0.5">${esc(a.d)}</span></span></button></li>`).join('')}</ol>
    </section>`;
    // ---------- 4. พับเก็บ: ปีนี้ / ทิศของคุณ ----------
    const be = s.year + 543;
    const ySum = [y5 ? `ระวัง${HOUSE_PALACE_SHORT[y5.p]}` : '', s.yearGood[0] ? `โชค${HOUSE_PALACE_SHORT[s.yearGood[0].p]}` : ''].filter(Boolean).join(' · ');
    h += `<details class="card p-4"><summary class="cursor-pointer"><b class="text-orange-300">🗓️ ปีนี้ ${be}</b> <span class="text-[12px] text-slate-400">${ySum}</span></summary>
        <ul class="text-[13px] space-y-1.5 mt-3">${s.yearBad.map(x => `<li>⚠️ <b class="text-white">${SIMPLE_PAL_TH[x.p]}</b> · ${x.title}${cn(x.cn)}</li>`).join('')}
        ${s.yearGood.map(x => `<li>✨ <b class="text-white">${SIMPLE_PAL_TH[x.p]}</b> · ${x.title}${cn(x.cn)} · ${remedyHtml(x.fix)}</li>`).join('')}</ul>
        <a href="annual.html" class="inline-block mt-3 text-[12px] text-sky-300 underline">ดูผังประจำปีพร้อมจานทิศ →</a></details>`;
    if (s.person) {
        const best = s.person.list[0];
        h += `<details class="card p-4"><summary class="cursor-pointer"><b class="text-sky-300">👤 ทิศดีของคุณ</b> <span class="text-[12px] text-slate-400">หัวเตียง/โต๊ะ หัน${HOUSE_PALACE_SHORT[best.p]}</span></summary>
            <div class="text-[12px] text-slate-400 mt-2">เลขประจำตัว ${s.person.kua}${cn('Kua ' + PERSON_KUA_TRIGRAM[s.person.kua])} · กลุ่มทิศ${s.person.east ? 'ตะวันออก' : 'ตะวันตก'}</div>
            <ul class="text-[13px] space-y-1.5 mt-2">${s.person.list.map(x => `<li><b class="${x.good ? 'text-emerald-300' : 'text-rose-300'}">${SIMPLE_PAL_TH[x.p]}</b> · ${x.th}${cn(x.c)}<div class="text-[12px] text-slate-400">${x.tip}</div></li>`).join('')}</ul></details>`;
    } else h += `<button type="button" id="askBirth" class="card p-4 w-full text-left text-[13px] text-slate-300">👤 ใส่วันเกิดเพื่อดูทิศดีสำหรับหัวเตียงและโต๊ะทำงาน →</button>`;
    box.innerHTML = h;
    box.querySelectorAll('#houseGrid [data-p]').forEach(el => el.addEventListener('click', () => selectPal(el.dataset.p === 'C' ? 'C' : +el.dataset.p)));
    box.querySelectorAll('[data-goto]').forEach(el => el.addEventListener('click', () => { selectPal(+el.dataset.goto); $('houseGrid').scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
    const ab = $('askBirth'); if (ab) ab.addEventListener('click', () => { $('setup').open = true; $('inBirth').focus(); });
    selectPal(s.bads[0] ? s.bads[0].p : (s.goods[0] ? s.goods[0].p : f.palace));
}

// ---------- ฟอร์มข้อมูลบ้าน ----------
function initSetup() {
    $('inFacing').value = house ? house.facing : '';
    $('inYear').value = house ? house.year : '';
    let b = '', g = 'M';
    try { b = localStorage.getItem('luopan_birthDate') || ''; g = localStorage.getItem('luopan_gender') || 'M'; } catch (e) {}
    $('inBirth').value = b ? b.slice(0, 10) : '';
    $('inGender').value = g;
    $('saveBtn').addEventListener('click', () => {
        const f = parseFloat($('inFacing').value);
        let y = parseInt($('inYear').value, 10);
        if (y > 2400) y -= 543; // ปี พ.ศ.
        if (isNaN(f) || f < 0 || f > 360) { $('setupMsg').textContent = 'ใส่ทิศหน้าบ้านเป็นองศา 0–360 หรือกดวัดด้วยวิธีด้านบน'; return; }
        if (!(y >= 1864 && y <= 2163)) { $('setupMsg').textContent = 'ใส่ปีที่สร้างบ้าน (ค.ศ. หรือ พ.ศ.)'; return; }
        house = { facing: Math.round(houseNorm360(f) * 10) / 10, year: y, period: house && house.period && house.year === y ? house.period : 'auto', savedAt: Date.now() };
        houseSave();
        try {
            const bd = $('inBirth').value;
            if (bd) {
                const old = localStorage.getItem('luopan_birthDate') || '';
                localStorage.setItem('luopan_birthDate', bd + (old.length > 10 && old.slice(0, 10) === bd ? old.slice(10) : 'T12:00'));
                localStorage.setItem('luopan_gender', $('inGender').value);
            }
        } catch (e) {}
        $('setupMsg').textContent = '';
        $('setup').open = false;
        renderSummary();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// โหมดมืออาชีพ: หัวเรื่องเป็นชื่อบ้านที่เปิดอยู่
if (APP_MODE === 'pro') { const r = housesActiveRec(); if (r) $('homeTitle').textContent = r.name; }
renderModeSwitch();
initSetup();
renderSummary();
// มาจากหล่อแกแบบง่ายหลังบันทึกทิศ: เปิดฟอร์มให้ใส่ปีที่สร้าง
if (location.hash === '#setup') { $('setup').open = true; setTimeout(() => { $('setup').scrollIntoView({ block: 'center' }); $('inYear').focus(); }, 300); }
