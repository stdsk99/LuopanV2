// ตรวจทิศเฟอร์นิเจอร์สำคัญ (สูตรล้วน ไม่มีโค้ดหน้าจอ) ใช้ 八宅 ของแต่ละคน (js/person-core.js) + ผลดาวเหินรายวัง (js/simple-core.js)
// หลักที่ใช้ (ตำราทั่วไป เขียนสรุปเอง): หัวเตียง/โต๊ะ/ประตู/หิ้งพระหันสู่ทิศดีของคนที่ใช้ · เตาตั้งทับทิศร้าย หันหน้าเตาสู่ทิศดี (坐凶向吉)
// ห้องน้ำทับทิศร้าย · ตู้เซฟอยู่วังที่ดาวน้ำดี · เตาไม่ควรอยู่พายัพ (火燒天門) หรือกลางบ้าน
// ข้อมูลต่อบ้านใน localStorage: luopan_furniture = { members: [{ id, name, birth, gender }], items: [{ id, type, member, facing, pal, note }] }

const FURN_GOOD_ORDER = {
    bed: ['天醫', '延年', '生氣', '伏位'],
    desk: ['生氣', '伏位', '延年', '天醫'],
    door: ['生氣', '延年', '天醫', '伏位'],
    shrine: ['生氣', '伏位', '延年', '天醫'],
    stove: ['生氣', '天醫', '延年', '伏位']
};
const FURN_TYPES = {
    bed: { l: 'เตียงนอน', icon: '🛏️', face: 'หัวเตียงหันไปทาง', person: true, loc: 'ตำแหน่งเตียง',
        how: 'วางมือถือราบบนที่นอน หัวเครื่องชี้ไปทางหัวเตียง (ทางที่หมอนอยู่)' },
    desk: { l: 'โต๊ะทำงาน/เรียน', icon: '💻', face: 'นั่งหันหน้าไปทาง', person: true, loc: 'ตำแหน่งโต๊ะ',
        how: 'นั่งที่โต๊ะ ถือมือถือราบ หัวเครื่องชี้ไปข้างหน้าทางที่คุณหันหน้า' },
    stove: { l: 'เตา', icon: '🔥', face: 'หน้าเตาหันไปทาง', person: false, loc: 'ตำแหน่งเตา',
        how: 'ยืนหน้าเตา ถือมือถือราบ หัวเครื่องชี้จากเตาออกมาหาตัวคุณ (ทางที่หน้าเตาหัน)' },
    door: { l: 'ประตูหลัก', icon: '🚪', face: 'ประตูหันออกไปทาง', person: false, loc: 'ตำแหน่งประตู',
        how: 'ยืนที่ประตู หันหน้าออกนอกบ้าน หัวเครื่องชี้ออกนอกประตู' },
    shrine: { l: 'หิ้งพระ', icon: '🛕', face: 'พระหันหน้าไปทาง', person: false, loc: 'ตำแหน่งหิ้งพระ',
        how: 'ยืนหน้าหิ้ง หันหลังให้หิ้ง หัวเครื่องชี้ไปทางเดียวกับที่พระหันหน้า' },
    toilet: { l: 'ห้องน้ำ', icon: '🚽', face: null, person: false, loc: 'ตำแหน่งห้องน้ำ', how: '' },
    safe: { l: 'ตู้เซฟ/ที่เก็บเงิน', icon: '💰', face: null, person: false, loc: 'ตำแหน่งตู้เซฟ', how: '' }
};

function furnLoad() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem('luopan_furniture') || 'null'); } catch (e) {}
    if (!d || !Array.isArray(d.items)) d = { members: [], items: [] };
    if (!Array.isArray(d.members)) d.members = [];
    return d;
}
function furnSave(d) { try { localStorage.setItem('luopan_furniture', JSON.stringify(d)); return true; } catch (e) { return false; } }
// สมาชิกทั้งหมด: เจ้าของบ้าน (จากข้อมูลบ้าน) + สมาชิกที่เพิ่มเอง · kua = 0 ถ้าไม่รู้วันเกิด
function furnMembers(d) {
    let b = null, g = 'M';
    try { b = localStorage.getItem('luopan_birthDate'); g = localStorage.getItem('luopan_gender') || 'M'; } catch (e) {}
    const kuaOf = (birth, gender) => { if (!birth) return 0; const t = new Date(birth); return isNaN(t) ? 0 : personKuaOf(getExactPillars(t).solarYear, gender); };
    return [{ id: 'owner', name: 'เจ้าของบ้าน', birth: b, gender: g, kua: kuaOf(b, g), owner: true }]
        .concat(d.members.map(m => ({ ...m, kua: kuaOf(m.birth, m.gender) })));
}

const furnDirCode = (deg) => HOUSE_PALACES[houseMountainOf(deg).palace];
// ทิศดีที่ใกล้ที่สุดจากทิศปัจจุบัน: { code, star, turn (+ = ตามเข็มนาฬิกา) }
function furnNearest(deg, kua, order) {
    const row = PERSON_8M_TABLE[kua]; if (!row) return null;
    let best = null, top = null;
    order.forEach((star, rank) => {
        const code = row[PERSON_8M_ORDER.indexOf(star)], c = HOUSE_PALACES.indexOf(code) * 45;
        const turn = ((c - deg + 540) % 360) - 180;
        const cost = Math.abs(turn) + rank * 20;  // ชอบทิศที่ดีกว่าเล็กน้อย แม้ต้องหมุนมากขึ้น
        if (!best || cost < best.cost) best = { code, star, turn: Math.round(turn), cost };
        if (rank === 0) top = { code, star, turn: Math.round(turn) };
    });
    if (best && top && top.code !== best.code) best.top = top;   // ทิศที่ดีที่สุดตามตำรา (ถ้าต่างจากทิศที่หมุนน้อย)
    return best;
}

// ประเมินของ 1 ชิ้น · sum = houseSummary (มีผลรายวัง) · ownerKua ใช้กับของที่ไม่ใช่ของส่วนตัว
function furnEval(item, members, sum) {
    const T = FURN_TYPES[item.type], out = { reasons: [], verdict: 'good', suggest: null };
    const mem = members.find(m => m.id === item.member) || members[0];
    const kua = T.person ? mem.kua : members[0].kua;
    const add = (k, t, cn) => out.reasons.push({ k, t, cn });   // k: ok / warn / bad
    const who = T.person ? (mem.owner ? 'เจ้าของบ้าน' : mem.name) : 'เจ้าของบ้าน';
    // ---------- ทิศที่หัน ----------
    if (T.face && typeof item.facing === 'number') {
        const code = furnDirCode(item.facing), e8 = kua ? personStarOf(code, kua) : null;
        const dirTh = PERSON_DIR_TH[code];
        if (!kua) add('warn', `${T.face}${dirTh} · ใส่วันเกิด${who}เพื่อตรวจว่าเป็นทิศดีไหม`);
        else if (e8.good) add('ok', `${T.face}${dirTh} = ทิศ${e8.th}ของ${who}`, e8.c);
        else {
            add('bad', `${T.face}${dirTh} = ทิศ${e8.th}ของ${who}`, e8.c);
            const n = furnNearest(item.facing, kua, FURN_GOOD_ORDER[item.type]);
            if (n) out.suggest = { ...n, th: PERSON_DIR_TH[n.code], info: PERSON_8M_INFO[n.star] };
        }
    }
    // ---------- ตำแหน่งในบ้าน ----------
    const p = item.pal;
    if (p === 'C') {
        if (item.type === 'stove') add('bad', 'เตาอยู่กลางบ้าน ไฟเผาหัวใจของบ้าน ควรย้าย');
        else if (item.type === 'toilet') add('bad', 'ห้องน้ำกลางบ้าน ถือว่าร้ายมาก ปิดประตูเสมอ วางต้นไม้/เกลือดูดความชื้น');
        else add('warn', `${T.loc}อยู่กลางบ้าน ควรรักษาให้โปร่ง`);
    } else if (typeof p === 'number' && sum) {
        const x = sum.pals[p], code = HOUSE_PALACES[p], e8 = kua ? personStarOf(code, kua) : null, ownE8 = members[0].kua ? personStarOf(code, members[0].kua) : null;
        const five = x.bad.find(b => b.cn === '五黃'), sick = x.bad.find(b => b.cn === '二黑');
        const locTh = PERSON_DIR_TH[code];
        if (item.type === 'bed') {
            if (SIMPLE_GOOD(x.tm) && x.m !== 5) add('ok', `${T.loc}อยู่ทิศ${locTh} ดาวภูเขา ${x.m} ดี เหมาะพักผ่อน สุขภาพดี`);
            if (e8 && !e8.good) add('warn', `${T.loc}อยู่ทิศ${e8.th}ของ${who} ถ้าย้ายไม่ได้ ให้หันหัวเตียงสู่ทิศดีแทน`, e8.c);
        } else if (item.type === 'desk') {
            if (SIMPLE_GOOD(x.tf) || [x.m, x.f, x.a].includes(4) || [x.m, x.f].includes(1)) add('ok', `${T.loc}อยู่ทิศ${locTh} มีดาวเสริมงาน/การเรียน`);
        } else if (item.type === 'stove') {
            if (code === 'NW') add('bad', 'เตาอยู่ทิศพายัพ (火燒天門 ไฟเผาประตูฟ้า) ไม่ดีต่อผู้นำบ้าน', '火燒天門');
            else if (ownE8 && !ownE8.good) add('ok', `เตาตั้งทับทิศ${ownE8.th}ของเจ้าของบ้าน ช่วยเผาสิ่งไม่ดี`, ownE8.c);
            else if (ownE8) add('warn', `เตาตั้งทับทิศ${ownE8.th} (ทิศดี) ของเจ้าของบ้าน เหมือนเผาโชคของตัวเอง`, ownE8.c);
        } else if (item.type === 'toilet') {
            if (ownE8 && !ownE8.good) add('ok', `ห้องน้ำอยู่ทับทิศ${ownE8.th}ของเจ้าของบ้าน ช่วยกดสิ่งไม่ดี`, ownE8.c);
            else if (ownE8) add('bad', `ห้องน้ำทับทิศ${ownE8.th} (ทิศดี) ของเจ้าของบ้าน โชคถูกชะล้าง · ปิดประตู วางต้นไม้ใบเขียว`, ownE8.c);
            if (x.tf === 'wang') add('warn', `ห้องน้ำอยู่ทิศที่ดาวน้ำ ${x.f} รุ่ง (ดาวเงิน) เงินรั่วไหล ปิดฝาชักโครกเสมอ`);
        } else if (item.type === 'safe') {
            if (SIMPLE_GOOD(x.tf) && x.f !== 5) add('ok', `ตู้เซฟอยู่ทิศ${locTh} ดาวน้ำ ${x.f} ดี (ดาวเงิน)`);
            else if (x.a === 8 || x.a === 9) add('ok', `ปีนี้ดาวจร ${x.a} เข้าทิศ${locTh} เสริมทรัพย์`);
            else add('warn', `ตู้เซฟอยู่ทิศ${locTh} ดาวน้ำไม่ดี ลองย้ายไปทิศที่ดาวน้ำรุ่ง`);
        } else if (item.type === 'door') {
            if (SIMPLE_GOOD(x.tf) && x.f !== 5) add('ok', `ประตูอยู่ทิศ${locTh} รับดาวน้ำ ${x.f} ที่ดี`);
            else if (x.f === 5) add('bad', `ประตูอยู่ทิศ${locTh} รับดาว 5 ร้าย · แขวนกระดิ่งลมทองเหลือง`);
        }
        if (five && ['bed', 'desk', 'door', 'stove'].includes(item.type)) add('bad', `ทิศ${locTh}มีดาว 5 (${five.short}) ${item.type === 'bed' ? 'ไม่ควรนอน' : 'ระวังอุบัติเหตุ'} · ใช้กระดิ่งลมทองเหลือง/โลหะ`, '五黃');
        else if (sick && item.type === 'bed') add('warn', `ทิศ${locTh}มีดาว 2 ระวังเจ็บป่วย · วางน้ำเต้าทองเหลือง`, '二黑');
    }
    if (!out.reasons.length) add('warn', 'ใส่ทิศหรือตำแหน่งเพื่อดูผล');
    out.verdict = out.reasons.some(r => r.k === 'bad') ? 'bad' : out.reasons.some(r => r.k === 'warn') ? 'warn' : 'good';
    return out;
}
