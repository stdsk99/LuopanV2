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
$('modeSimple').addEventListener('click', () => { appModeSet('simple'); renderModeSwitch(); });
$('modePro').addEventListener('click', () => appModeGo('pro'));

// ---------- ข้อมูลเจ้าของบ้าน (ชุดเดียวกับหน้าอื่น) ----------
function ownerKua() {
    let b = null, g = 'M';
    try { b = localStorage.getItem('luopan_birthDate'); g = localStorage.getItem('luopan_gender') || 'M'; } catch (e) {}
    if (!b) return 0;
    const d = new Date(b);
    if (isNaN(d)) return 0;
    return personKuaOf(getExactPillars(d).solarYear, g);
}

// ---------- ส่วนแสดงผล ----------
const starsHtml = (n) => {
    const full = Math.floor(n), half = n - full >= 0.5;
    let s = '';
    for (let i = 0; i < 5; i++) s += i < full ? '<span class="text-yellow-400">★</span>' : (i === full && half ? '<span class="star-half">★</span>' : '<span class="text-slate-700">★</span>');
    return `<div class="star" role="img" aria-label="${n} จาก 5 ดาว">${s}</div>`;
};
const remedyHtml = (rm) => rm ? `<span class="inline-flex flex-wrap gap-x-3 gap-y-1">${rm.items.map(it => `<span class="whitespace-nowrap">${iconHtml(it, 22)} ${it.l}</span>`).join('')}</span>${rm.note ? ` <span class="text-red-300 text-[11px]">(${rm.note})</span>` : ''}` : '';
const dirName = (p) => `${SIMPLE_PAL_TH[p]}${cn(SIMPLE_TRIGRAM[p])}`;

function renderSummary() {
    const box = $('summary');
    if (!house) {
        box.innerHTML = `<section class="card p-5 text-center">
            <div class="text-4xl mb-2">🏡</div>
            <h2 class="text-lg font-bold text-yellow-300">ดูฮวงจุ้ยบ้านของคุณใน 3 ขั้น</h2>
            <ol class="text-[13px] text-slate-300 mt-3 space-y-1 text-left inline-block">
                <li>1. วัดทิศหน้าบ้าน</li><li>2. ใส่ปีที่สร้างบ้าน</li><li>3. ดูผลและวิธีแก้</li>
            </ol>
            <p class="text-[12px] text-slate-400 mt-3">เริ่มที่ "ข้อมูลบ้าน" ด้านล่าง</p></section>`;
        $('setup').open = true;
        return;
    }
    const year = getExactPillars(new Date()).solarYear;
    const kua = ownerKua();
    const s = houseSummary(house.facing, housePeriod(), year, kua);
    const ch = s.ch, f = ch.f;
    const facingTxt = `บ้านหัน${SIMPLE_PAL_TH[f.palace]}${cn(HOUSE_M24[f.m])} ${house.facing.toFixed(1)}° · สร้างยุค ${ch.P}`;
    let h = `<section class="card p-4" aria-labelledby="hRate">
        <div class="text-[12px] text-slate-400">${facingTxt}</div>
        <div class="flex items-end gap-3 mt-2">${starsHtml(s.stars)}<h2 id="hRate" class="text-2xl font-bold text-white pb-0.5">${s.rating.th}</h2></div>
        <p class="text-[13px] text-slate-300 mt-1">${s.rating.t}</p>
        <ul class="mt-3 space-y-1 text-[13px]">${s.reasons.map(r => `<li class="flex gap-2"><span class="${r.ok ? 'text-emerald-400' : 'text-red-400'} font-bold">${r.ok ? '✓' : '✗'}</span><span>${esc(r.t)}${cn(r.cn)}</span></li>`).join('')}</ul>
        ${ch.ti ? `<p class="text-[11px] text-slate-500 mt-2">ใช้ผังทดแทน${cn('替卦')} ตามตัวเลือก</p>` : ''}
    </section>`;
    // จุดเด่น
    if (s.goods.length) h += `<section class="card p-4" aria-labelledby="hGood">
        <h2 id="hGood" class="font-bold text-emerald-300">✨ จุดเด่นของบ้าน</h2>
        <div class="mt-2 divide-y divide-slate-800">${s.goods.map(x => `<div class="py-3">
            <div class="flex flex-wrap items-baseline gap-x-2"><b class="text-white">${dirName(x.p)}</b><span class="text-emerald-300 text-[13px]">${x.good.title}${cn(x.good.cn)}</span></div>
            <div class="text-[13px] text-slate-300 mt-1">เหมาะเป็น: ${x.good.use.join(' · ')}</div>
            ${x.good.boost ? `<div class="text-[13px] text-slate-300 mt-1">เสริมด้วย: ${remedyHtml(x.good.boost)}</div>` : ''}
            <div class="text-[11px] text-slate-500 mt-1">${x.good.why}</div></div>`).join('')}</div></section>`;
    // จุดต้องแก้
    if (s.bads.length) h += `<section class="card p-4" aria-labelledby="hBad">
        <h2 id="hBad" class="font-bold text-amber-300">🛠️ จุดที่ควรแก้</h2>
        <div class="mt-2 divide-y divide-slate-800">${s.bads.map(x => { const b = x.bad[0]; return `<div class="py-3">
            <div class="flex flex-wrap items-baseline gap-x-2"><b class="text-white">${dirName(x.p)}</b><span class="text-red-300 text-[13px]">${esc(b.title)}${cn(b.cn)}</span></div>
            ${b.text ? `<div class="text-[13px] text-slate-300 mt-1">${esc(b.text)}</div>` : ''}
            ${b.fix ? `<div class="text-[13px] text-slate-300 mt-1">แก้ด้วย: ${remedyHtml(b.fix)}</div>` : ''}
            ${b.fixText ? `<div class="text-[13px] text-slate-300 mt-1">แก้ด้วย: ${esc(b.fixText)}</div>` : ''}
            ${b.avoid ? `<div class="text-[12px] text-amber-200/90 mt-1">${esc(b.avoid)}</div>` : ''}
            ${x.bad.slice(1).map(o => `<div class="text-[12px] text-red-300/90 mt-1">+ ${esc(o.title)}${cn(o.cn)}</div>`).join('')}
            <div class="text-[11px] text-slate-500 mt-1">${b.why}</div></div>`; }).join('')}</div></section>`;
    // ปีนี้
    const be = s.year + 543;
    h += `<section class="card p-4" aria-labelledby="hYear">
        <h2 id="hYear" class="font-bold text-orange-300">🗓️ ปีนี้ ${be} (${s.year})</h2>
        <div class="text-[12px] text-red-300 font-semibold mt-2">ระวัง</div>
        <ul class="text-[13px] space-y-1.5 mt-1">${s.yearBad.map(x => `<li><b class="text-white">${dirName(x.p)}</b> · ${x.title}${cn(x.cn)}${x.fix ? `<div class="text-[12px] text-slate-400">${remedyHtml(x.fix)}</div>` : ''}</li>`).join('')}</ul>
        <div class="text-[12px] text-emerald-300 font-semibold mt-3">เสริมโชค</div>
        <ul class="text-[13px] space-y-1.5 mt-1">${s.yearGood.map(x => `<li><b class="text-white">${dirName(x.p)}</b> · ${x.title}${cn(x.cn)}<div class="text-[12px] text-slate-400">${remedyHtml(x.fix)}</div></li>`).join('')}</ul>
        <a href="annual.html" class="inline-block mt-3 text-[12px] text-sky-300 underline">ดูผังประจำปีพร้อมจานทิศ →</a>
    </section>`;
    // เจ้าของบ้าน
    if (s.person) h += `<section class="card p-4" aria-labelledby="hPerson">
        <h2 id="hPerson" class="font-bold text-sky-300">👤 ทิศดีของเจ้าของบ้าน</h2>
        <div class="text-[12px] text-slate-400 mt-1">เลขประจำตัว ${s.person.kua}${cn('Kua ' + PERSON_KUA_TRIGRAM[s.person.kua])} · กลุ่มทิศ${s.person.east ? 'ตะวันออก' : 'ตะวันตก'}</div>
        <ul class="text-[13px] space-y-1.5 mt-2">${s.person.list.map(x => `<li><b class="${x.good ? 'text-emerald-300' : 'text-red-300'}">${SIMPLE_PAL_TH[x.p]}</b> · ${x.th}${cn(x.c)}<div class="text-[12px] text-slate-400">${x.tip}</div></li>`).join('')}</ul>
    </section>`;
    else h += `<section class="card p-4 text-[13px] text-slate-300">👤 ใส่วันเกิดเจ้าของบ้านใน "ข้อมูลบ้าน" เพื่อดูทิศดีสำหรับหัวเตียงและโต๊ะทำงาน</section>`;
    h += `<p class="text-[12px] text-slate-400 px-1">💡 ทิศในบ้านนับจากจุดกลางบ้าน ใช้ <a href="plan.html" class="text-sky-300 underline">แปลนบ้าน</a> เพื่อดูว่าแต่ละทิศตรงกับห้องไหน</p>`;
    box.innerHTML = h;
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

renderModeSwitch();
initSetup();
renderSummary();
