// ตั้งค่าทิศอ้างอิงในหน้าเข็มทิศ (แท็บตั้งค่า) ข้อมูลและสูตรอยู่ใน js/magdec.js
(function initNorthUI() {
    const seg = document.getElementById('northSeg'), info = document.getElementById('northInfo'), btn = document.getElementById('northLocBtn');
    if (!seg) return;
    function paint() {
        seg.querySelectorAll('button').forEach(b => {
            const on = b.dataset.v === NORTH.mode;
            b.classList.toggle('bg-teal-600', on); b.classList.toggle('border-teal-400', on); b.classList.toggle('bg-slate-900', !on);
            b.setAttribute('aria-pressed', String(on));
        });
        const d = northDecl();
        info.innerHTML = `มุมเบี่ยง ณ ${NORTH.place}: <b class="text-teal-300">${d >= 0 ? '+' : ''}${d.toFixed(2)}°</b> (${d >= 0 ? 'ตะวันออก' : 'ตะวันตก'})<br>`
            + (NORTH.mode === 'true' ? `กำลังใช้ <b>ทิศเหนือจริง</b> · องศาจากเข็มทิศถูกปรับ ${d >= 0 ? '+' : ''}${d.toFixed(2)}°` : 'กำลังใช้ <b>ทิศแม่เหล็ก</b> · ไม่ปรับองศา');
    }
    seg.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        NORTH.mode = b.dataset.v; northSave(); paint();
        showToast(NORTH.mode === 'true' ? `ใช้ทิศเหนือจริง (ปรับ ${northDecl().toFixed(2)}°)` : 'ใช้ทิศแม่เหล็ก (ทิศเดิม)');
    });
    btn.addEventListener('click', () => {
        btn.disabled = true; btn.textContent = 'กำลังหาตำแหน่ง…';
        northLocate((ok, msg) => {
            btn.disabled = false; btn.textContent = '📍 ใช้ตำแหน่งปัจจุบันคำนวณมุมเบี่ยง';
            showToast(ok ? `มุมเบี่ยงที่ตำแหน่งนี้ ${northDecl().toFixed(2)}°` : msg); paint();
        });
    });
    paint();
})();
