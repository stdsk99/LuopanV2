// รายงานฮวงจุ้ยบ้าน (report.html) สำหรับพิมพ์/บันทึกเป็น PDF ส่งลูกค้า
// ใช้บ้านที่เปิดอยู่ (js/houses.js) · ผลจาก js/simple-core.js · ภาพของเสริมจาก js/remedy-core.js
// ข้อมูลผู้ดู (ชื่อ สำนัก เบอร์ LINE) เก็บใน localStorage: luopan_consultant

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cn = (s) => s ? ` <span class="cn muted" style="font-size:.85em">${s}</span>` : '';
const thDate = (d) => d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
const ST_CLASS = { good: 's-good', bad: 's-bad', mid: 's-mid' };
const ST_ICON = { good: '✅', bad: '⚠️', mid: '◽' };
const RING = [1, 2, 5, 8, 7, 6, 3, 0];   // ช่องตาราง 9 ช่อง วนตามเข็มนาฬิกาจากช่องบนกลาง

// ---------- ข้อมูลผู้ดู ----------
let CONS = {};
try { CONS = JSON.parse(localStorage.getItem('luopan_consultant') || '{}') || {}; } catch (e) { CONS = {}; }
const consLine = () => [CONS.name, CONS.org].filter(Boolean).join(' · ');
const consContact = () => [CONS.phone && '📞 ' + CONS.phone, CONS.line && 'LINE ' + CONS.line].filter(Boolean).join('  ');
['Name', 'Org', 'Phone', 'Line'].forEach(k => {
    const el = $('c' + k); el.value = CONS[k.toLowerCase()] || '';
    el.addEventListener('input', () => { CONS[k.toLowerCase()] = el.value.trim(); try { localStorage.setItem('luopan_consultant', JSON.stringify(CONS)); } catch (e) {} render(); });
});
$('cfgBtn').addEventListener('click', () => $('cfg').classList.toggle('open'));
$('printBtn').addEventListener('click', () => window.print());
if (APP_MODE === 'pro') $('backLink').href = 'houses.html';

// ---------- ส่วนประกอบ ----------
const starsHtml = (n) => { let s = ''; for (let i = 0; i < 5; i++) s += `<span style="color:${i < Math.floor(n) ? '#ca8a04' : (i === Math.floor(n) && n % 1 ? '#e7c55a' : '#e7e5e4')}">★</span>`; return s; };
const seal = `<svg class="seal" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="#fef3c7" stroke="#a16207" stroke-width="3"/><circle cx="50" cy="50" r="38" fill="none" stroke="#ca8a04" stroke-width="1.2"/>${[...Array(24)].map((_, i) => { const a = i * 15 * Math.PI / 180; return `<line x1="${50 + 38 * Math.sin(a)}" y1="${50 - 38 * Math.cos(a)}" x2="${50 + 44 * Math.sin(a)}" y2="${50 - 44 * Math.cos(a)}" stroke="#ca8a04" stroke-width="${i % 3 ? .8 : 1.6}"/>`; }).join('')}<circle cx="50" cy="50" r="16" fill="#1c1917"/><path d="M50,34 a16,16 0 0 1 0,32 a8,8 0 0 1 0,-16 a8,8 0 0 0 0,-16" fill="#fef3c7"/><circle cx="50" cy="42" r="2.6" fill="#1c1917"/><circle cx="50" cy="58" r="2.6" fill="#fef3c7"/><path d="M50,8 L46,18 L54,18Z" fill="#be123c"/></svg>`;
function foot(n) { return `<div class="foot"><span>${esc(consLine() || 'Luopan 3D Pro')}${consContact() ? ' · ' + esc(consContact()) : ''}</span><span>หน้า ${n}</span></div>`; }
// ของเสริมที่ใช้ในรายงาน (สรุปวิธีวางรวมไว้หน้าเดียว ไม่ซ้ำ)
let USED = [];
const remInline = (items) => `<div style="display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:4px">${items.filter(it => REMEDY_LIB[it.i]).map(it => { if (!USED.includes(it.i)) USED.push(it.i); return `<span style="display:inline-flex;align-items:center;gap:5px"><svg width="30" height="30" viewBox="0 0 64 64">${remedyArt(it.i)}</svg>${REMEDY_LIB[it.i].l}</span>`; }).join('')}</div>`;
const remRow = (it) => { const r = REMEDY_LIB[it.i]; return r ? `<div class="rem"><svg width="46" height="46" viewBox="0 0 64 64">${remedyArt(it.i)}</svg><div><b>${r.l}</b><div class="muted" style="font-size:12px">${esc(r.how)}</div></div></div>` : ''; };
function grid9(s, label) {
    const f = s.ch.f, cellPal = new Array(9).fill('C');
    RING.forEach((g, k) => { cellPal[g] = (f.palace + k) % 8; });
    return `<div style="text-align:center;font-size:11px" class="muted">▲ หน้าบ้าน</div><div class="grid9" style="margin-top:3px">${cellPal.map(p => {
        if (p === 'C') return `<div class="cell s-mid"><b>กลางบ้าน</b>${label ? `<div style="font-size:12px">ดาว ${s.ch.mt.c} / ${s.ch.ft.c}</div>` : ''}</div>`;
        const x = s.pals[p], st = simplePalState(x);
        return `<div class="cell ${ST_CLASS[st]}"><b>${HOUSE_PALACE_SHORT[p]}</b>${cn(SIMPLE_TRIGRAM[p])}<div style="font-size:12px">${ST_ICON[st]} ${simplePalLabel(x, st)}</div></div>`;
    }).join('')}</div>`;
}

// ---------- ประกอบรายงาน ----------
function render() {
    const rec = housesActiveRec() || { name: 'บ้าน' };
    if (!house) { $('doc').innerHTML = `<section class="page"><h2>ยังไม่มีข้อมูลทิศบ้าน</h2><p>วัดทิศหน้าบ้านและใส่ปีที่สร้างก่อน แล้วกลับมาที่หน้านี้</p></section>`; return; }
    const year = getExactPillars(new Date()).solarYear;
    const s = houseSummary(house.facing, housePeriod(), year, simpleOwnerKua());
    const ch = s.ch, f = ch.f, today = new Date();
    document.title = `รายงานฮวงจุ้ย - ${rec.name}`;
    let n = 0, h = ''; USED = [];
    // 1. ปก
    h += `<section class="page cover">${seal}
        <div class="muted" style="letter-spacing:3px;font-size:12px">รายงานฮวงจุ้ยบ้าน · 風水報告</div>
        <h1>${esc(rec.name)}</h1>
        <div class="box" style="margin:8mm auto 0;max-width:150mm">
            <div class="stars">${starsHtml(s.stars)}</div>
            <div style="font-size:22px;font-weight:700;margin-top:4px">${s.rating.th} <span class="muted" style="font-size:14px;font-weight:400">(${s.stars} / 5 ดาว)</span></div>
            <div class="muted">${s.rating.t}</div>
        </div>
        <div class="box kv" style="margin:6mm auto 0;max-width:150mm">
            ${rec.owner ? `<b>เจ้าของบ้าน</b><span>${esc(rec.owner)}</span>` : ''}
            ${rec.addr ? `<b>ที่อยู่</b><span>${esc(rec.addr)}</span>` : ''}
            ${rec.visit ? `<b>วันที่ไปดู</b><span>${thDate(new Date(rec.visit + 'T00:00'))}</span>` : ''}
            <b>ทิศหน้าบ้าน</b><span>${HOUSE_PALACE_TH[f.palace]} · ภูเขา <span class="cn">${HOUSE_M24[f.m]}</span> ${HOUSE_M24_TH[f.m]} · ${house.facing.toFixed(1)}°</span>
            <b>ยุคของบ้าน</b><span>ยุค ${ch.P} (สร้าง/รีโนเวทปี ${house.year}) · ปัจจุบันยุค ${ch.C}</span>
            <b>วันที่ทำรายงาน</b><span>${thDate(today)}</span>
        </div>
        <div style="margin-top:auto;padding-top:10mm">${consLine() ? `<div style="font-size:15px;font-weight:600">${esc(consLine())}</div>` : ''}${consContact() ? `<div class="muted">${esc(consContact())}</div>` : ''}</div>
        ${foot(++n)}</section>`;
    // 2. ภาพรวม
    const acts = simpleActions(s);
    h += `<section class="page"><h2>สรุปภาพรวม</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="box"><h3>ทำไมได้ ${s.stars} ดาว</h3><ul style="margin:6px 0 0;padding-left:0;list-style:none">${s.reasons.map(r => `<li style="margin:4px 0"><b class="${r.ok ? 'good' : 'bad'}">${r.ok ? '✓' : '✗'}</b> ${esc(r.t)}${cn(r.cn)}</li>`).join('')}</ul></div>
            <div>${grid9(s, true)}<div class="muted" style="font-size:11px;text-align:center;margin-top:4px">✅ ดี · ⚠️ ควรแก้ · ◽ ปกติ</div></div>
        </div>
        <h2 style="margin-top:16px">ทำ 3 อย่างนี้ก่อน</h2>
        ${acts.map((a, i) => `<div class="row"><div style="font-size:20px">${a.i}</div><div><h3>${i + 1}. ${esc(a.t)}</h3><div class="muted">${esc(a.d)}</div></div></div>`).join('')}
        <p class="muted" style="font-size:12px;margin-top:12px">ทิศในบ้านนับจากจุดกลางบ้าน แบ่งเป็น 8 ทิศ ทิศละ 45°</p>
        ${foot(++n)}</section>`;
    // 3. วิธีแก้ทีละทิศ (ร้ายก่อน แล้วดี)
    const sev = (x) => Math.max(0, ...x.bad.map(b => b.sev || 1));
    const order = s.pals.filter(x => x.good || x.bad.length).sort((a, b) => (sev(b) - sev(a)) || (b.score - a.score));
    h += `<section class="page"><h2>วิธีแก้และเสริมทีละทิศ</h2>${order.map(x => {
        const st = simplePalState(x);
        let body = '';
        if (x.good && st !== 'bad') body += `<div class="good" style="font-weight:600">✅ ${x.good.title}</div><div>เหมาะเป็น: ${x.good.use.join(' · ')}</div>${x.good.boost ? remInline(x.good.boost.items) : ''}`;
        x.bad.slice().sort((a, b) => (b.sev || 1) - (a.sev || 1)).forEach(b => {
            body += `<div class="bad" style="font-weight:600;margin-top:4px">⚠️ ${esc(b.title)}${cn(b.cn)}</div>`;
            if (b.text) body += `<div>${esc(b.text)}</div>`;
            if (b.fix) body += remInline(b.fix.items);
            if (b.fixText) body += `<div>แก้ด้วย: ${esc(b.fixText)}</div>`;
            if (b.avoid) body += `<div class="muted">${esc(b.avoid)}</div>`;
        });
        return `<div class="row" style="break-inside:avoid"><div><span class="tag ${ST_CLASS[st]}" style="border:1px solid">${HOUSE_PALACES[x.p]}</span></div><div><h3>${SIMPLE_PAL_TH[x.p]}${cn(SIMPLE_TRIGRAM[x.p])}</h3>${body}</div></div>`;
    }).join('')}${foot(++n)}</section>`;
    // 4. แปลน (ถ้ามี)
    let plan = null; try { plan = JSON.parse(localStorage.getItem('luopan_plan') || 'null'); } catch (e) {}
    const fl = plan && plan.floors ? plan.floors.filter(x => x.img || Object.values(x.rooms || {}).some(Boolean)) : [];
    fl.forEach(fr => {
        const r = fr.rect || { x0: 0.18, y0: 0.14, x1: 0.82, y1: 0.86 }, front = fr.front || 0;
        const x0 = Math.min(r.x0, r.x1) * 100, y0 = Math.min(r.y0, r.y1) * 100, w = Math.abs(r.x1 - r.x0) * 100, hh = Math.abs(r.y1 - r.y0) * 100;
        const palOf = (g) => g === 4 ? 'C' : (f.palace + (((RING.indexOf(g) - 2 * front) % 8) + 8) % 8) % 8;
        const cells = [...Array(9)].map((_, g) => {
            const p = palOf(g), nm = (fr.rooms || {})[g] || '';
            const x = p === 'C' ? null : s.pals[p], st = x ? simplePalState(x) : 'mid';
            return { g, p, nm, x, st };
        });
        const tint = { good: 'rgba(16,185,129,.22)', bad: 'rgba(244,63,94,.22)', mid: 'rgba(120,113,108,.12)' };
        h += `<section class="page"><h2>แปลนบ้าน · ${esc(fr.name || '')}</h2>
            <div style="position:relative;width:100%;aspect-ratio:${1 / (fr.aspect || 0.75)};background:#f5f5f4;border:1px solid var(--line);border-radius:8px;overflow:hidden">
                ${fr.img ? `<img src="${fr.img}" alt="แปลนบ้าน" style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill">` : ''}
                <div style="position:absolute;left:${x0}%;top:${y0}%;width:${w}%;height:${hh}%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);border:2px solid #a16207">
                    ${cells.map(c => `<div style="border:1px dashed #a16207;background:${tint[c.st]};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:11px;line-height:1.25"><b style="background:#fffdf8cc;padding:0 4px;border-radius:4px">${c.p === 'C' ? 'กลาง' : HOUSE_PALACE_SHORT[c.p]}</b>${c.x ? `<span style="background:#fffdf8cc;padding:0 4px;border-radius:4px">${ST_ICON[c.st]} ${simplePalLabel(c.x, c.st)}</span>` : ''}</div>`).join('')}
                </div>
            </div>
            ${cells.some(c => c.nm) ? `<table style="margin-top:10px"><tr><th>ห้อง</th><th>ทิศ</th><th>ผล</th></tr>${cells.filter(c => c.nm).map(c => `<tr><td><b>${esc(c.nm)}</b></td><td>${c.p === 'C' ? 'กลางบ้าน' : SIMPLE_PAL_TH[c.p]}</td><td class="${c.st === 'good' ? 'good' : c.st === 'bad' ? 'bad' : ''}">${c.x ? ST_ICON[c.st] + ' ' + (c.st === 'good' ? c.x.good.title : c.x.bad[0] ? c.x.bad[0].title : 'ปกติ') : 'รักษาให้โปร่ง สะอาด'}</td></tr>`).join('')}</table>` : ''}
            ${foot(++n)}</section>`;
    });
    // 5. ปีนี้ + ทิศดีของเจ้าของ
    h += `<section class="page"><h2>ปีนี้ ${s.year + 543} (${s.year})</h2>
        <h3 class="bad">ทิศที่ต้องระวัง</h3>${s.yearBad.map(y => `<div class="row" style="break-inside:avoid"><div>⚠️</div><div><b>${SIMPLE_PAL_TH[y.p]}</b> · ${y.title}${cn(y.cn)}<div class="muted">${y.t}</div>${y.fix ? remInline(y.fix.items) : ''}</div></div>`).join('')}
        <h3 class="good" style="margin-top:10px">ทิศเสริมโชค</h3>${s.yearGood.map(y => `<div class="row" style="break-inside:avoid"><div>✨</div><div><b>${SIMPLE_PAL_TH[y.p]}</b> · ${y.title}${cn(y.cn)}${remInline(y.fix.items)}</div></div>`).join('')}
        ${s.person ? `<h2 style="margin-top:16px">ทิศดีของเจ้าของบ้าน</h2><div class="muted">เลข Kua ${s.person.kua}${cn(PERSON_KUA_TRIGRAM[s.person.kua])} · กลุ่มทิศ${s.person.east ? 'ตะวันออก' : 'ตะวันตก'}</div>
            <table style="margin-top:6px">${s.person.list.map(x => `<tr><td style="width:150px"><b class="${x.good ? 'good' : 'bad'}">${SIMPLE_PAL_TH[x.p]}</b></td><td>${x.th}${cn(x.c)}<div class="muted" style="font-size:12px">${x.tip}</div></td></tr>`).join('')}</table>` : ''}
        ${foot(++n)}</section>`;
    // 6. คู่มือของเสริมที่ใช้
    if (USED.length) h += `<section class="page"><h2>คู่มือของเสริมและของแก้</h2><p class="muted" style="margin-top:-4px">ของทุกชิ้นที่แนะนำในรายงานนี้ พร้อมวิธีวางและข้อห้าม</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;font-size:12px">${USED.map(id => { const r = REMEDY_LIB[id]; return `<div class="box guide" style="break-inside:avoid;display:grid;grid-template-columns:auto 1fr;gap:8px;padding:8px 10px"><svg width="48" height="48" viewBox="0 0 64 64">${remedyArt(id)}</svg><div><b style="font-size:1.15em">${r.l}</b> <span class="muted" style="font-size:11px">ธาตุ${r.el}</span><div><b>วาง:</b> ${esc(r.where)}</div><div><b>วิธี:</b> ${esc(r.how)}</div><div class="bad"><b>ห้าม:</b> ${esc(r.avoid)}</div></div></div>`; }).join('')}</div>
        ${foot(++n)}</section>`;
    // 7. ภาคผนวก: ผังดาวเหินเต็ม
    const cellPal = new Array(9).fill('C'); RING.forEach((g, k) => { cellPal[g] = (f.palace + k) % 8; });
    const warn = houseWarning(house.facing);
    h += `<section class="page"><h2>ภาคผนวก · ผังดาวเหิน <span class="cn" style="font-size:14px">玄空飛星</span></h2>
        <div class="muted" style="margin-bottom:8px">นั่ง <span class="cn">${HOUSE_M24[ch.s.m]}</span> หัน <span class="cn">${HOUSE_M24[f.m]}</span> · ผังยุค ${ch.P} · ดาวจรปี ${s.year}${ch.ti ? ' · ใช้ผังทดแทน 替卦' : ''}</div>
        <div style="text-align:center;font-size:11px" class="muted">▲ หน้าบ้าน</div>
        <div class="fs" style="max-width:120mm;margin:3px auto 0">${cellPal.map(p => {
            const c = p === 'C', m = c ? ch.mt.c : ch.mt.g[p], w = c ? ch.ft.c : ch.ft.g[p], b = c ? ch.base.c : ch.base.g[p], a = c ? ch.an.c : ch.an.g[p];
            return `<div><span class="m">${m}</span><span class="w">${w}</span><span class="b">${b}</span><span class="a">${a}</span><span class="d">${c ? 'กลาง' : HOUSE_PALACES[p] + ' ' + HOUSE_PALACE_SHORT[p]}</span></div>`;
        }).join('')}</div>
        <div class="muted" style="font-size:11px;text-align:center;margin-top:5px"><span style="color:#b45309">■ ดาวภูเขา (ซ้ายบน)</span> · <span style="color:#1d4ed8">■ ดาวน้ำ (ขวาบน)</span> · ■ ดาวยุค (กลาง) · <span style="background:#fde68a;padding:0 4px">ดาวจรปี</span></div>
        ${ch.pat.length ? `<h3 style="margin-top:14px">ลักษณะผัง</h3>${ch.pat.map(x => `<div style="margin:4px 0"><b class="${x.k === 'good' ? 'good' : x.k === 'bad' ? 'bad' : ''}"><span class="cn">${x.c}</span> ${x.th}</b> · <span class="muted">${x.t}</span></div>`).join('')}` : ''}
        ${warn ? `<div style="margin-top:10px" class="bad">${warn}</div>` : ''}
        <div class="box muted" style="margin-top:16px;font-size:11.5px">ผลวิเคราะห์อิงหลักฮวงจุ้ยดาวเหิน (玄空飛星) และ 八宅 ใช้ประกอบการตัดสินใจเท่านั้น ไม่ใช่การรับประกันผล · ดาว 1–5 เป็นเกณฑ์สรุปของแอป · ควรวัดทิศซ้ำหลายจุดก่อนปรับปรุงบ้าน</div>
        ${foot(++n)}</section>`;
    $('doc').innerHTML = h;
}
render();
