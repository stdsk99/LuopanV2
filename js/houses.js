// เก็บหลายบ้าน/หลายลูกค้า (localStorage: luopan_houses) · โหลดต่อจาก mode.js ก่อนสคริปต์อื่นทุกหน้า
// หลักการ: ทุกหน้ายังอ่าน/เขียนคีย์เดิม (luopan_house, luopan_plan, luopan_birthDate, luopan_gender) = "บ้านที่เปิดอยู่"
// ไฟล์นี้สลับข้อมูลในคีย์เดิมกับรายการบ้านเมื่อบ้านที่ต้องเปิดเปลี่ยน · ข้อมูลของบ้านที่เปิดอยู่จะอยู่ในคีย์เดิมเท่านั้น (ไม่เก็บซ้ำ)
// โหมดทั่วไปเปิด "บ้านของฉัน" (mine) เสมอ · โหมดมืออาชีพเปิดบ้านที่เลือกล่าสุด (cur)

const HOUSES_KEY = 'luopan_houses';
const HOUSE_DATA_KEYS = { house: 'luopan_house', plan: 'luopan_plan', birth: 'luopan_birthDate', gender: 'luopan_gender' };
let HOUSES = null;   // { v, list: [{ id, name, owner, phone, addr, visit, note, created, data: { house, plan, birth, gender } | null }], mine, cur, active }

const housesNewId = () => 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function housesWrite() { localStorage.setItem(HOUSES_KEY, JSON.stringify(HOUSES)); }
// อ่านคีย์เดิมทั้งชุด (ค่าเป็นข้อความดิบ)
function housesReadLegacy() { const d = {}; for (const k in HOUSE_DATA_KEYS) d[k] = localStorage.getItem(HOUSE_DATA_KEYS[k]); return d; }
function housesWriteLegacy(d) {
    for (const k in HOUSE_DATA_KEYS) {
        const v = d ? d[k] : null;
        if (v === null || v === undefined) localStorage.removeItem(HOUSE_DATA_KEYS[k]); else localStorage.setItem(HOUSE_DATA_KEYS[k], v);
    }
}
const housesFind = (id) => HOUSES.list.find(h => h.id === id);
// บ้านที่หน้านี้ควรเปิด ตามโหมด
const housesWantId = () => (typeof APP_MODE !== 'undefined' && APP_MODE === 'simple') ? HOUSES.mine : HOUSES.cur;

// ย้ายข้อมูลของบ้านที่เปิดอยู่จากคีย์เดิมกลับเข้ารายการ แล้วเปิดบ้าน id แทน
function housesActivate(id) {
    if (HOUSES.active === id) return true;
    const oldRec = housesFind(HOUSES.active), newRec = housesFind(id);
    if (!newRec) return false;
    const backup = JSON.stringify(HOUSES), legacy = housesReadLegacy();
    try {
        if (oldRec) oldRec.data = legacy;
        const d = newRec.data || {};
        newRec.data = null;
        HOUSES.active = id;
        housesWriteLegacy({});           // ล้างก่อน เพื่อให้มีพื้นที่พอ
        housesWrite();
        housesWriteLegacy(d);
        return true;
    } catch (e) {
        // พื้นที่เต็ม: คืนค่าเดิมทั้งหมด
        try { HOUSES = JSON.parse(backup); housesWriteLegacy(legacy); housesWrite(); } catch (e2) {}
        alert('สลับบ้านไม่ได้ เพราะพื้นที่เก็บข้อมูลในเครื่องเต็ม\nลองลบรูปแปลนของบ้านที่ไม่ใช้ หรือสำรองแล้วลบบ้านเก่าออก');
        return false;
    }
}

(function housesInit() {
    try { HOUSES = JSON.parse(localStorage.getItem(HOUSES_KEY) || 'null'); } catch (e) { HOUSES = null; }
    if (!HOUSES || !Array.isArray(HOUSES.list) || !HOUSES.list.length) {
        // ครั้งแรก: ข้อมูลเดิมกลายเป็น "บ้านของฉัน"
        const id = housesNewId();
        HOUSES = { v: 1, list: [{ id, name: 'บ้านของฉัน', owner: '', phone: '', addr: '', visit: '', note: '', created: Date.now(), data: null }], mine: id, cur: id, active: id };
        try { housesWrite(); } catch (e) {}
        return;
    }
    if (!housesFind(HOUSES.mine)) HOUSES.mine = HOUSES.list[0].id;
    if (!housesFind(HOUSES.cur)) HOUSES.cur = HOUSES.mine;
    if (!housesFind(HOUSES.active)) HOUSES.active = null;
    const want = housesWantId();
    if (HOUSES.active === null) {
        // ไม่รู้ว่าคีย์เดิมเป็นของบ้านไหน: ถือว่าเป็นของบ้านที่ต้องเปิด
        HOUSES.active = want; const r = housesFind(want); if (r && r.data) { housesWriteLegacy(r.data); r.data = null; }
        try { housesWrite(); } catch (e) {}
    } else housesActivate(want);
})();

// ---------- ใช้จากหน้ารายการบ้าน ----------
function housesActiveRec() { return housesFind(HOUSES.active); }
// ข้อมูลเต็มของบ้าน (บ้านที่เปิดอยู่อ่านจากคีย์เดิม)
function housesDataOf(rec) { return rec.id === HOUSES.active ? housesReadLegacy() : (rec.data || {}); }
function housesParse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
// เปิดบ้านในโหมดมืออาชีพ
function housesOpen(id) { if (!housesActivate(id)) return false; HOUSES.cur = id; housesWrite(); return true; }
function housesAdd(info, data) {
    const rec = { id: housesNewId(), name: info.name || 'บ้านใหม่', owner: info.owner || '', phone: info.phone || '', addr: info.addr || '', visit: info.visit || '', note: info.note || '', created: Date.now(), data: data || {} };
    HOUSES.list.push(rec);
    try { housesWrite(); } catch (e) { HOUSES.list.pop(); alert('เพิ่มบ้านไม่ได้ พื้นที่เก็บข้อมูลเต็ม'); return null; }
    return rec;
}
function housesUpdateInfo(id, info) { const r = housesFind(id); if (!r) return; Object.assign(r, info); housesWrite(); }
function housesCopy(id) {
    const r = housesFind(id); if (!r) return null;
    return housesAdd({ ...r, name: r.name + ' (สำเนา)' }, JSON.parse(JSON.stringify(housesDataOf(r))));
}
function housesRemove(id) {
    if (HOUSES.list.length <= 1) return false;
    if (HOUSES.active === id) {
        const other = HOUSES.list.find(h => h.id !== id);
        if (!housesActivate(other.id)) return false;
        HOUSES.cur = other.id;
    }
    HOUSES.list = HOUSES.list.filter(h => h.id !== id);
    if (HOUSES.mine === id) HOUSES.mine = HOUSES.list[0].id;
    if (HOUSES.cur === id) HOUSES.cur = HOUSES.active;
    housesWrite();
    return true;
}
// ไฟล์สำรอง: ทุกบ้านพร้อมข้อมูลเต็ม
function housesExport() {
    return { app: 'LuopanV2', kind: 'houses', v: 1, exported: new Date().toISOString(), mine: HOUSES.mine,
        list: HOUSES.list.map(r => ({ ...r, data: housesDataOf(r) })) };
}
// นำเข้า: mode 'add' = เพิ่มต่อท้าย (ได้รหัสใหม่) · 'replace' = แทนที่ทั้งหมด
function housesImport(obj, mode) {
    if (!obj || obj.app !== 'LuopanV2' || !Array.isArray(obj.list) || !obj.list.length) throw new Error('ไม่ใช่ไฟล์สำรองของแอปนี้');
    const backup = JSON.stringify(HOUSES), legacy = housesReadLegacy();
    try {
        if (mode === 'replace') {
            HOUSES = { v: 1, list: obj.list.map(r => ({ ...r })), mine: obj.mine, cur: obj.mine, active: null };
            if (!housesFind(HOUSES.mine)) HOUSES.mine = HOUSES.list[0].id;
            HOUSES.cur = HOUSES.mine;
            const want = housesWantId(), r = housesFind(want);
            housesWriteLegacy({});
            HOUSES.active = want; const d = r.data || {}; r.data = null;
            housesWrite(); housesWriteLegacy(d);
        } else {
            obj.list.forEach(r => HOUSES.list.push({ ...r, id: housesNewId() }));
            housesWrite();
        }
        return obj.list.length;
    } catch (e) {
        try { HOUSES = JSON.parse(backup); housesWriteLegacy(legacy); housesWrite(); } catch (e2) {}
        throw new Error('พื้นที่เก็บข้อมูลไม่พอ นำเข้าไม่สำเร็จ');
    }
}
// พื้นที่ที่ใช้ (ประมาณ เป็น KB) ของข้อมูลบ้านทั้งหมด
function housesUsageKB() {
    let n = (localStorage.getItem(HOUSES_KEY) || '').length;
    for (const k in HOUSE_DATA_KEYS) n += (localStorage.getItem(HOUSE_DATA_KEYS[k]) || '').length;
    return Math.round(n * 2 / 1024);
}
// แสดงชื่อบ้านที่เปิดอยู่ในทุก element ที่มี data-house-name (โหมดมืออาชีพ)
document.addEventListener('DOMContentLoaded', () => {
    const r = housesActiveRec();
    document.querySelectorAll('[data-house-name]').forEach(el => { el.textContent = r ? r.name : ''; });
});
