// หน้ารายการบ้านและลูกค้า (houses.html) โหมดมืออาชีพ · ข้อมูลและการสลับบ้านอยู่ใน js/houses.js

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const thDate = (iso) => { if (!iso) return ''; const d = new Date(iso + 'T00:00'); return isNaN(d) ? iso : d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }); };
let editId = null;

// สรุปทิศบ้านจากข้อมูลที่เก็บไว้
function facingTxt(rec) {
    const d = housesDataOf(rec), h = housesParse(d.house), pl = housesParse(d.plan);
    const parts = [];
    if (h && typeof h.facing === 'number') {
        const m = houseMountainOf(h.facing);
        const P = h.period === 'auto' ? housePeriodOf(h.year) : +h.period;
        parts.push(`หัน <span class="cn text-white">${HOUSE_M24[m.m]}</span> ${h.facing.toFixed(1)}° · ยุค ${P} (${h.year})`);
    } else parts.push('<span class="text-amber-300">ยังไม่ได้วัดทิศ</span>');
    if (pl && pl.floors && pl.floors.some(f => f.img || f.rect || Object.keys(f.rooms || {}).length)) parts.push('📐 มีแปลน');
    return parts.join(' · ');
}

function render() {
    const q = $('q').value.trim().toLowerCase();
    const list = HOUSES.list.slice().sort((a, b) => (b.id === HOUSES.active) - (a.id === HOUSES.active) || (b.visit || '').localeCompare(a.visit || '') || b.created - a.created)
        .filter(r => !q || [r.name, r.owner, r.addr, r.phone, r.note].join(' ').toLowerCase().includes(q));
    $('list').innerHTML = list.map(r => {
        const act = r.id === HOUSES.active, mine = r.id === HOUSES.mine;
        return `<article class="card p-3.5" style="${act ? 'border-color:#eab308;box-shadow:0 0 0 1px #eab308' : ''}">
            <div class="flex flex-wrap items-center gap-1.5">
                <h2 class="text-[15px] font-bold text-white mr-1">${esc(r.name)}</h2>
                ${act ? '<span class="text-[11px] px-2 rounded-full" style="background:#eab308;color:#0f172a">เปิดอยู่</span>' : ''}
                ${mine ? '<span class="text-[11px] px-2 rounded-full" style="background:#064e3b;color:#a7f3d0">🏠 บ้านของฉัน</span>' : ''}
            </div>
            <div class="text-[12.5px] text-slate-300 mt-1">${[r.owner && '👤 ' + esc(r.owner), r.phone && `📞 <a href="tel:${esc(r.phone)}" class="text-sky-300">${esc(r.phone)}</a>`, r.visit && '📅 ' + thDate(r.visit)].filter(Boolean).join(' · ') || '<span class="text-slate-500">ยังไม่มีข้อมูลเจ้าของ</span>'}</div>
            ${r.addr ? `<div class="text-[12.5px] text-slate-400">📍 ${esc(r.addr)}</div>` : ''}
            <div class="text-[12.5px] text-slate-400 mt-1">${facingTxt(r)}</div>
            ${r.note ? `<div class="text-[12px] text-slate-400 mt-1 line-clamp-2">📝 ${esc(r.note)}</div>` : ''}
            <div class="flex flex-wrap gap-1.5 mt-2.5">
                ${act ? `<a href="index.html" class="btn btn-gold">🧭 เข็มทิศ</a><a href="plan.html" class="btn">📐 แปลน</a><a href="home.html" class="btn">⭐ สรุป</a>`
                      : `<button type="button" class="btn btn-gold" data-act="open" data-id="${r.id}">เปิดบ้านนี้</button>`}
                <button type="button" class="btn" data-act="report" data-id="${r.id}">📄 รายงาน</button>
                <button type="button" class="btn" data-act="edit" data-id="${r.id}">แก้ไข</button>
                <button type="button" class="btn" data-act="copy" data-id="${r.id}">คัดลอก</button>
                ${mine ? '' : `<button type="button" class="btn" data-act="mine" data-id="${r.id}">ตั้งเป็นบ้านของฉัน</button>`}
                ${HOUSES.list.length > 1 ? `<button type="button" class="btn" style="color:#fda4af" data-act="del" data-id="${r.id}">ลบ</button>` : ''}
            </div></article>`;
    }).join('') || '<p class="text-center text-slate-500 text-[13px] py-6">ไม่พบบ้านที่ค้นหา</p>';
    const kb = housesUsageKB(), pct = Math.min(100, kb / 5000 * 100);
    $('useTxt').textContent = `~${kb.toLocaleString()} KB จากประมาณ 5,000 KB`;
    $('useBar').style.width = pct + '%';
    $('useBar').style.background = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e';
}

// ---------- ฟอร์ม ----------
function openForm(id) {
    editId = id || null;
    const r = id ? housesFind(id) : {};
    $('dlgTitle').textContent = id ? 'แก้ไขข้อมูลบ้าน' : 'เพิ่มบ้านใหม่';
    $('fName').value = r.name || ''; $('fOwner').value = r.owner || ''; $('fPhone').value = r.phone || '';
    $('fAddr').value = r.addr || ''; $('fVisit').value = r.visit || (id ? '' : new Date().toISOString().slice(0, 10)); $('fNote').value = r.note || '';
    $('dlg').showModal();
    $('fName').focus();
}
$('dlgCancel').addEventListener('click', () => $('dlg').close());
$('frm').addEventListener('submit', (e) => {
    const info = { name: $('fName').value.trim(), owner: $('fOwner').value.trim(), phone: $('fPhone').value.trim(), addr: $('fAddr').value.trim(), visit: $('fVisit').value, note: $('fNote').value.trim() };
    if (!info.name) { e.preventDefault(); $('fName').focus(); return; }
    if (editId) { housesUpdateInfo(editId, info); render(); return; }
    const rec = housesAdd(info, {});
    if (rec && confirm(`เพิ่ม "${info.name}" แล้ว\nเปิดบ้านนี้เพื่อวัดทิศเลยไหม?`)) { if (housesOpen(rec.id)) location.href = 'index.html'; }
    render();
});
$('addBtn').addEventListener('click', () => openForm(null));
$('q').addEventListener('input', render);

// ---------- ปุ่มในการ์ด ----------
$('list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = b.dataset.id, r = housesFind(id);
    if (b.dataset.act === 'open') { if (housesOpen(id)) render(); }
    else if (b.dataset.act === 'report') { if (housesOpen(id)) location.href = 'report.html'; }
    else if (b.dataset.act === 'edit') openForm(id);
    else if (b.dataset.act === 'copy') { housesCopy(id); render(); }
    else if (b.dataset.act === 'mine') { HOUSES.mine = id; housesWrite(); render(); }
    else if (b.dataset.act === 'del') {
        if (!confirm(`ลบ "${r.name}" ถาวร?\nทิศ แปลน และข้อมูลเจ้าของของบ้านนี้จะหายทั้งหมด (สำรองไฟล์ไว้ก่อนได้)`)) return;
        housesRemove(id); render();
    }
});

// ---------- สำรอง / นำเข้า ----------
$('expBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(housesExport())], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `luopan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$('impFile').addEventListener('change', async () => {
    const f = $('impFile').files[0]; if (!f) return;
    let obj = null;
    try { obj = JSON.parse(await f.text()); } catch (e) {}
    const box = $('impBox');
    box.classList.remove('hidden');
    if (!obj || obj.app !== 'LuopanV2' || !Array.isArray(obj.list)) { box.innerHTML = '❌ ไฟล์นี้ไม่ใช่ไฟล์สำรองของแอปนี้'; return; }
    box.innerHTML = `ไฟล์สำรองวันที่ ${new Date(obj.exported).toLocaleString('th-TH')} มีบ้าน <b>${obj.list.length}</b> หลัง
        <div class="flex flex-wrap gap-2 mt-2"><button type="button" class="btn btn-gold" data-imp="add">เพิ่มเข้ารายการเดิม</button><button type="button" class="btn" style="color:#fda4af" data-imp="replace">แทนที่ทั้งหมด</button><button type="button" class="btn" data-imp="cancel">ยกเลิก</button></div>`;
    box.onclick = (e) => {
        const m = e.target.closest('[data-imp]'); if (!m) return;
        if (m.dataset.imp === 'cancel') { box.classList.add('hidden'); $('impFile').value = ''; return; }
        if (m.dataset.imp === 'replace' && !confirm('แทนที่บ้านทั้งหมดในเครื่องนี้ด้วยข้อมูลจากไฟล์?\nบ้านที่มีอยู่ตอนนี้จะหาย')) return;
        try { const n = housesImport(obj, m.dataset.imp); box.innerHTML = `✔ นำเข้า ${n} หลังแล้ว`; render(); }
        catch (err) { box.innerHTML = '❌ ' + err.message; }
        $('impFile').value = '';
    };
});

render();
