// ผังรายห้อง (小太極) สูตรล้วน: ใช้ผังดาวเหินของทั้งบ้าน วางลง 8 ทิศรอบจุดกลางห้อง + ทิศดีของคนที่ใช้ห้อง (八宅)
// แต่ละมุมของห้องได้คะแนนตามหน้าที่ (เตียง โต๊ะ น้ำ ของแก้ ที่เก็บของ) แล้วเลือกมุมที่ดีที่สุดของแต่ละหน้าที่
// เกณฑ์คะแนนแอปกำหนดเองจากหลักตำราทั่วไป · ห้องเก็บใน luopan_furniture.rooms = [{ id, name, type, member, door }]
// door = ทิศของประตูห้อง (วัง 0–7 นับจากกลางห้อง) ใช้หมุนผังให้ประตูอยู่ด้านล่างเหมือนเดินเข้าห้อง

const ROOM_TYPES = {
    bed: { l: 'ห้องนอน', icon: '🛏️', jobs: ['bed', 'fix', 'store'] },
    kid: { l: 'ห้องนอนเด็ก/ห้องเรียน', icon: '🧒', jobs: ['bed', 'desk', 'fix', 'store'] },
    work: { l: 'ห้องทำงาน', icon: '💼', jobs: ['desk', 'water', 'fix', 'store'] },
    live: { l: 'ห้องนั่งเล่น/รับแขก', icon: '🛋️', jobs: ['seat', 'water', 'fix', 'store'] },
    shop: { l: 'ร้านค้า/ออฟฟิศ', icon: '🏪', jobs: ['cash', 'water', 'fix', 'store'] }
};
const ROOM_JOB = {
    bed: { l: 'ตำแหน่งเตียง', icon: '🛏️' }, desk: { l: 'ตำแหน่งโต๊ะ', icon: '💻' }, seat: { l: 'โซฟา/ที่นั่งหลัก', icon: '🛋️' },
    cash: { l: 'เคาน์เตอร์/ที่เก็บเงิน', icon: '💰' }, water: { l: 'น้ำพุ/ตู้ปลา', icon: '💧' },
    fix: { l: 'วางของแก้', icon: '🔔' }, store: { l: 'ตู้เก็บของ/ถังขยะ', icon: '🗑️' }
};
const ROOM_TL = { wang: 3, sheng: 2, tui: 0, shuai: -1, sha: -4 };

// วิเคราะห์ห้อง · ch = houseChart (มี C) · kua = เลข Kua ของคนที่ใช้ห้อง (0 = ไม่รู้)
function roomAnalyze(room, ch, kua) {
    const C = ch.C, T = ROOM_TYPES[room.type] || ROOM_TYPES.bed;
    const cells = [0, 1, 2, 3, 4, 5, 6, 7].map(p => {
        const m = ch.mt.g[p], f = ch.ft.g[p], a = ch.an.g[p], code = HOUSE_PALACES[p];
        const tm = houseTimeliness(m, C).k, tf = houseTimeliness(f, C).k, e8 = kua ? personStarOf(code, kua) : null;
        const e8v = !e8 ? 0 : e8.rank === 1 ? 2 : e8.rank <= 4 ? 1.5 : e8.rank === 8 ? -2.5 : -1.5;
        const bad5 = m === 5 || f === 5, a5 = a === 5, a2 = a === 2;
        const sc = {
            bed: ROOM_TL[tm] + e8v - (a5 ? 3 : 0) - (a2 ? 1.5 : 0) - (f === 5 ? 1 : 0),
            desk: ROOM_TL[tf] * 0.6 + ([m, f, a].includes(4) ? 1.5 : 0) + ([m, f].includes(1) ? 0.8 : 0) + e8v - (bad5 || a5 ? 3 : 0),
            seat: ROOM_TL[tm] * 0.6 + ROOM_TL[tf] * 0.6 + e8v - (bad5 || a5 ? 3 : 0),
            cash: ROOM_TL[tf] + (a === 8 || a === 9 ? 1 : 0) - (f === 5 || a5 ? 4 : 0),
            water: (tf === 'wang' ? 3 : tf === 'sheng' ? 2 : -2) - (tm === 'wang' ? 3 : 0) - (f === 5 || a5 ? 5 : 0),
            fix: (bad5 ? 3 : 0) + (a5 ? 3 : 0) + (a2 ? 2 : 0) + (m === 2 || f === 2 ? 1 : 0),
            store: -(ROOM_TL[tm] + ROOM_TL[tf]) - e8v - (bad5 ? 3 : 0)
        };
        return { p, m, f, a, tm, tf, e8, sc, bad5, a5, a2 };
    });
    const why = {
        bed: (c) => [SIMPLE_GOOD(c.tm) ? `ดาวภูเขา ${c.m} ดี (พักผ่อน สุขภาพ)` : null, c.e8 && c.e8.good ? `ทิศ${c.e8.th}ของผู้ใช้ห้อง` : null].filter(Boolean),
        desk: (c) => [[c.m, c.f, c.a].includes(4) ? 'มีดาว 4 (การเรียน งานเขียน)' : null, SIMPLE_GOOD(c.tf) ? `ดาวน้ำ ${c.f} ดี (งาน เงิน)` : null, c.e8 && c.e8.good ? `ทิศ${c.e8.th}ของผู้ใช้ห้อง` : null].filter(Boolean),
        seat: (c) => [SIMPLE_GOOD(c.tm) ? `ดาวภูเขา ${c.m} ดี` : null, SIMPLE_GOOD(c.tf) ? `ดาวน้ำ ${c.f} ดี` : null, c.e8 && c.e8.good ? `ทิศ${c.e8.th}` : null].filter(Boolean),
        cash: (c) => [SIMPLE_GOOD(c.tf) ? `ดาวน้ำ ${c.f} ดี (ดาวเงิน)` : null, c.a === 8 || c.a === 9 ? `ปีนี้ดาวจร ${c.a}` : null].filter(Boolean),
        water: (c) => [c.tf === 'wang' ? `ดาวน้ำ ${c.f} รุ่ง` : `ดาวน้ำ ${c.f} กำลังมา`],
        fix: (c) => [c.bad5 ? 'มีดาว 5 ในผัง' : null, c.a5 ? 'ปีนี้ดาวจร 5' : null, c.a2 ? 'ปีนี้ดาวจร 2' : null, c.m === 2 || c.f === 2 ? 'มีดาว 2 ในผัง' : null].filter(Boolean),
        store: () => ['พลังอ่อนที่สุดของห้อง ใช้กดสิ่งไม่ดี']
    };
    const picks = T.jobs.map(job => {
        const sorted = cells.slice().sort((x, y) => y.sc[job] - x.sc[job]);
        let best = sorted.filter(c => c.sc[job] > (job === 'fix' ? 0 : job === 'water' ? 0 : -99));
        if (job === 'fix') best = best.slice(0, 2); else if (job === 'water') best = best.slice(0, 1); else best = best.slice(0, 1);
        return { job, cells: best.map(c => ({ p: c.p, why: why[job](c) })), avoid: job === 'bed' || job === 'desk' || job === 'seat' || job === 'cash' ? sorted.slice(-1).map(c => c.p) : [] };
    }).filter(x => x.cells.length);
    // ทิศหันหัวเตียง/โต๊ะที่ดีของผู้ใช้ห้อง
    const row = kua ? PERSON_8M_TABLE[kua] : null;
    const facing = row ? { bed: [row[1], row[2]], desk: [row[0], row[3]] } : null;
    return { cells, picks, facing };
}
