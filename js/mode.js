// โหมดการใช้งาน: 'simple' = ผู้ใช้ทั่วไป (เริ่มที่หน้าบ้านของฉัน home.html), 'pro' = มืออาชีพ (เริ่มที่เข็มทิศ index.html)
// เก็บใน localStorage: luopan_mode · เปิดครั้งแรกเป็นโหมดทั่วไปเสมอ · ลิงก์ ?mode=simple / ?mode=pro เปลี่ยนโหมดให้ทันที
// โหลดก่อนสคริปต์อื่นของหน้า (ไม่ใช้ข้อมูลจากไฟล์อื่น)
let APP_MODE = 'simple';
(function () {
    let saved = null;
    try { saved = localStorage.getItem('luopan_mode'); } catch (e) {}
    const q = new URLSearchParams(location.search).get('mode');
    if (q === 'simple' || q === 'pro') { saved = q; try { localStorage.setItem('luopan_mode', q); } catch (e) {} }
    APP_MODE = saved === 'pro' ? 'pro' : 'simple';
})();
function appModeSet(m) {
    APP_MODE = m === 'pro' ? 'pro' : 'simple';
    try { localStorage.setItem('luopan_mode', APP_MODE); } catch (e) {}
}
// สลับโหมดแล้วไปหน้าเริ่มของโหมดนั้น
function appModeGo(m) {
    appModeSet(m);
    location.href = APP_MODE === 'pro' ? 'index.html' : 'home.html';
}
// โหมดทั่วไป: ปุ่มย้อนกลับ (a[data-back]) ไปหน้าบ้านของฉันแทนเข็มทิศ
document.addEventListener('DOMContentLoaded', () => {
    if (APP_MODE !== 'simple') return;
    document.querySelectorAll('a[data-back]').forEach(a => { a.href = 'home.html'; a.textContent = '← บ้านของฉัน'; });
    document.querySelectorAll('[data-simple-only]').forEach(el => { el.style.display = 'flex'; });
});
