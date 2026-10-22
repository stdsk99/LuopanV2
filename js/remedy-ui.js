// การ์ดรายละเอียดของเสริม/ของแก้ (แผ่นเลื่อนขึ้นจากด้านล่าง) ใช้ได้ทุกหน้าที่โหลด js/remedy-core.js
// วิธีใช้: ใส่ data-remedy="<รหัส>" ให้ปุ่มหรือชิปใดก็ได้ แตะแล้วการ์ดจะเปิดเอง · หรือใช้ remedyChip(it) สร้างชิปพร้อมรูป

const STAR_TOPIC = { 1: 'การงาน', 2: 'โรคภัย', 3: 'ทะเลาะ', 4: 'การเรียน', 5: 'เคราะห์ร้าย', 6: 'อำนาจ', 7: 'ขโมย', 8: 'ทรัพย์สิน', 9: 'ชื่อเสียง' };

// ชิปของเสริม: รูป + ชื่อ แตะเพื่อดูรายละเอียด
function remedyChip(it, size) {
    if (!REMEDY_LIB[it.i]) return `<span class="whitespace-nowrap">${iconHtml(it, size || 22)} ${it.l}</span>`;
    return `<button type="button" data-remedy="${it.i}" class="inline-flex items-center gap-1.5 rounded-full pl-0.5 pr-2.5 py-0.5 text-[12.5px] whitespace-nowrap" style="background:#1e293b;border:1px solid #334155;color:#e2e8f0">${iconHtml(it, size || 24)}<span>${it.l}</span><span style="color:#64748b">›</span></button>`;
}

function remedySheetOpen(id) {
    const r = REMEDY_LIB[id]; if (!r) return;
    const c = REMEDY_EL[r.el];
    let ov = document.getElementById('remedySheet');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'remedySheet';
        ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'rsTitle');
        ov.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;align-items:flex-end;justify-content:center;background:rgba(2,6,23,.72);backdrop-filter:blur(2px)';
        ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-rs-close]')) remedySheetClose(); });
        document.body.appendChild(ov);
    }
    const stars = remedyStarsOf(id);
    const row = (icon, head, text, col) => `<div style="display:grid;grid-template-columns:28px minmax(0,1fr);gap:8px;padding:10px 0;border-top:1px solid #1e293b"><div style="font-size:18px;line-height:1.3">${icon}</div><div><div style="font-size:12px;color:${col || '#94a3b8'};font-weight:600">${head}</div><div style="font-size:14px;color:#e2e8f0;line-height:1.55">${text}</div></div></div>`;
    ov.innerHTML = `<div style="width:100%;max-width:520px;max-height:88vh;overflow:auto;background:#0f172a;border:1px solid #334155;border-bottom:0;border-radius:22px 22px 0 0;padding:10px 18px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.5)">
        <div style="width:44px;height:5px;border-radius:3px;background:#334155;margin:0 auto 10px"></div>
        <div style="display:flex;gap:16px;align-items:center">
            <svg width="112" height="112" viewBox="0 0 64 64" aria-hidden="true" style="flex-shrink:0;filter:drop-shadow(0 6px 14px ${c.ring}55)">${remedyArt(id)}</svg>
            <div style="min-width:0">
                <h2 id="rsTitle" style="font-size:21px;font-weight:700;color:#fff;line-height:1.25">${r.l}</h2>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
                    <span style="${c.chip};font-size:12px;padding:2px 10px;border-radius:999px">ธาตุ${r.el}</span>
                    <span style="font-size:12px;padding:2px 10px;border-radius:999px;${r.k === 'boost' ? 'background:#064e3b;color:#a7f3d0' : 'background:#4c0519;color:#fecdd3'}">${r.k === 'boost' ? '✨ เสริมโชค' : '🛡️ ลดร้าย'}</span>
                </div>
                ${stars.length ? `<div style="font-size:12px;color:#94a3b8;margin-top:8px">ใช้กับดาว ${stars.map(n => `<b style="color:#facc15">${n}</b> ${STAR_TOPIC[n]}`).join(' · ')}</div>` : ''}
            </div>
        </div>
        <div style="margin-top:12px">
            ${row('🎯', 'ใช้เพื่อ', r.for, '#facc15')}
            ${row('📍', 'วางตรงไหน', r.where, '#7dd3fc')}
            ${row('🖐️', 'วิธีวาง', r.how, '#86efac')}
            ${row('⛔', 'ข้อห้าม', r.avoid, '#fda4af')}
        </div>
        <button type="button" data-rs-close style="width:100%;margin-top:10px;padding:12px;border-radius:14px;background:#1e293b;color:#e2e8f0;font-weight:600;border:1px solid #334155">ปิด</button>
    </div>`;
    ov.style.display = 'flex';
    remedySheetOpen.last = document.activeElement;
    ov.querySelector('[data-rs-close]').focus();
}
function remedySheetClose() {
    const ov = document.getElementById('remedySheet');
    if (ov) ov.style.display = 'none';
    if (remedySheetOpen.last && remedySheetOpen.last.focus) remedySheetOpen.last.focus();
}
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-remedy]');
    if (el) { e.preventDefault(); e.stopPropagation(); remedySheetOpen(el.dataset.remedy); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') remedySheetClose(); });
