// อัปเดตอัตโนมัติ: GitHub Pages ให้เบราว์เซอร์จำหน้าเว็บไว้ได้ถึง 10 นาที
// ตอนเปิดแอป ถามเลขเวอร์ชันล่าสุดจาก version.json (ไม่ใช้ของที่จำไว้)
// ถ้าใหม่กว่าเวอร์ชันของหน้านี้ จะโหลดหน้าใหม่พร้อม ?v=<เวอร์ชัน> ให้เอง
(function () {
    const current = window.APP_VERSION;
    if (!current || !window.fetch || location.protocol === 'file:') return;
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
            if (!j || !j.v || j.v === current) return;
            const url = new URL(location.href);
            if (url.searchParams.get('v') === j.v) return; // โหลดใหม่ไปแล้วรอบหนึ่ง ไม่วนซ้ำ
            url.searchParams.set('v', j.v);
            location.replace(url.toString());
        })
        .catch(() => {});
})();
