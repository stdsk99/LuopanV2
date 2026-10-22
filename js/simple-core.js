// สรุปผลบ้านแบบภาษาง่าย สำหรับโหมดผู้ใช้ทั่วไป (หน้า home.html)
// ใช้สูตรชุดเดียวกับโหมดมืออาชีพ: js/fs-core.js (ดาวเหิน), js/fs-pairs.js (คู่ดาว), js/person-core.js (八宅/Kua), js/remedy-core.js (ของเสริม)
// ไม่มีโค้ดที่ผูกกับหน้าจอ · เกณฑ์ให้คะแนนและดาว 1–5 แอปกำหนดเอง (ไม่ได้มาจากตำราโดยตรง)

const SIMPLE_TL = { wang: 3, sheng: 2, tui: 0, shuai: -1, sha: -3, lock: -1.5 };
const SIMPLE_GOOD = (k) => k === 'wang' || k === 'sheng';
const SIMPLE_PAL_TH = ['ทิศเหนือ', 'ทิศตะวันออกเฉียงเหนือ', 'ทิศตะวันออก', 'ทิศตะวันออกเฉียงใต้', 'ทิศใต้', 'ทิศตะวันตกเฉียงใต้', 'ทิศตะวันตก', 'ทิศตะวันตกเฉียงเหนือ'];
const SIMPLE_TRIGRAM = ['坎', '艮', '震', '巽', '離', '坤', '兌', '乾'];
// นักษัตรในแต่ละวัง (ใช้หาทิศไท้ส่วยและทิศแตกของปี)
const SIMPLE_ZHI_PAL = [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7];
const SIMPLE_RATING = [null,
    { th: 'ต้องแก้หลายจุด', t: 'บ้านนี้มีจุดที่ควรแก้หลายจุด ค่อย ๆ แก้ทีละจุดจากรายการด้านล่าง' },
    { th: 'ควรปรับ', t: 'บ้านพอใช้ได้ แต่มีจุดอ่อนสำคัญที่ควรปรับ' },
    { th: 'ปานกลาง', t: 'บ้านกลาง ๆ มีทั้งจุดดีและจุดที่ควรระวัง' },
    { th: 'ดี', t: 'บ้านดี พลังสำคัญอยู่ถูกที่ ดูแลจุดอ่อนเล็กน้อยก็พอ' },
    { th: 'ดีมาก', t: 'บ้านดีมาก พลังเงินและพลังคนอยู่ถูกที่' }
];

// วังที่ดาวภูเขาดี: เสริมด้วยความมั่นคง ของหนัก (ไม่ใช้น้ำ เพราะน้ำทำให้ดาวภูเขา "ตกน้ำ")
const SIMPLE_MOUNTAIN_BOOST = { p: 'เสริมพลังคน', items: [{ i: '🪨', l: 'หินหรือคริสตัล' }, { i: '🗄️', l: 'ตู้หรือของหนัก' }], note: 'ห้ามวางน้ำ' };
// วิเคราะห์ทีละวัง: คะแนน, เหตุผลภาษาง่าย, ใช้ทำอะไร, ของเสริม/แก้
function simplePalace(ch, p, kua) {
    const C = ch.C, m = ch.mt.g[p], f = ch.ft.g[p], a = ch.an.g[p], code = HOUSE_PALACES[p];
    const tm = houseTimeliness(m, C).k, tf = houseTimeliness(f, C).k;
    let score = SIMPLE_TL[tm] + SIMPLE_TL[tf];
    const e8 = kua ? personStarOf(code, kua) : null;
    if (e8) score += (e8.rank === 1 ? 3 : e8.rank <= 4 ? 2 : e8.rank === 5 ? -1 : e8.rank === 8 ? -3 : -2) * 0.5;
    if (a === 5) score -= 2; else if (a === 2) score -= 1; else if (a === 8 || a === 9 || a === 1) score += 0.5;
    const r = { p, code, name: SIMPLE_PAL_TH[p], tri: SIMPLE_TRIGRAM[p], m, f, a, tm, tf, e8, score, good: null, bad: [] };
    // ด้านดี
    const gm = SIMPLE_GOOD(tm) && m !== 5, gf = SIMPLE_GOOD(tf) && f !== 5;
    if (gm || gf) {
        r.good = {
            title: gm && gf ? 'ดีทั้งเรื่องเงินและสุขภาพ' : gf ? 'ดีเรื่องเงิน โอกาส การค้า' : 'ดีเรื่องสุขภาพ คนในบ้าน ผู้อุปถัมภ์',
            use: [gf ? 'ประตู ทางเดิน ห้องนั่งเล่น โต๊ะทำงาน (ควรเปิดโล่ง มีการเคลื่อนไหว)' : null,
                  gm ? 'ห้องนอน มุมพักผ่อน (ควรสงบ วางตู้หรือของหนักได้)' : null].filter(Boolean),
            boost: gf ? REMEDY[f] : SIMPLE_MOUNTAIN_BOOST,
            why: `ดาวน้ำ ${f} ${houseTimeliness(f, C).th} · ดาวภูเขา ${m} ${houseTimeliness(m, C).th}`
        };
    } else if (e8 && e8.good) {
        r.good = { title: `ทิศ${e8.th}ของเจ้าของบ้าน`, use: [e8.tip], boost: null, why: `ทิศ ${e8.c} ของเจ้าของบ้าน`, cn: e8.c };
    }
    // ด้านที่ต้องแก้ (เรียงจากสำคัญ)
    if (m === 5 || f === 5) r.bad.push({ title: 'ระวังอุบัติเหตุ เจ็บป่วย', fix: REMEDY[5], avoid: 'ไม่ควรเป็นห้องนอนหรือประตูหลัก ห้ามสีแดง', why: `มีดาว 5 (${m === 5 ? 'ภูเขา' : 'น้ำ'})`, cn: '五黃' });
    const pr = fsPair(m, f);
    if (FS_TRIGGER_BAD.includes(pr.key) && m !== 5 && f !== 5 && !(gm && gf)) r.bad.push({ title: pr.b.split(/[ ,]/).slice(0, 4).join(' '), text: pr.b, fixText: pr.r, why: `คู่ดาว ${pr.key} ${pr.t}` });
    if (a === 5) r.bad.push({ title: 'ปีนี้ห้ามซ่อม เจาะ ทุบ', fix: REMEDY[5], avoid: 'ห้ามต่อเติมหรือเริ่มงานก่อสร้างทิศนี้ทั้งปี', why: 'ดาวจรปี 5', cn: '五黃' });
    else if (a === 2) r.bad.push({ title: 'ปีนี้ระวังเจ็บป่วย', fix: REMEDY[2], avoid: 'ไม่ควรเป็นห้องนอนผู้สูงอายุหรือคนป่วย', why: 'ดาวจรปี 2', cn: '二黑' });
    if (!r.bad.length && !gm && !gf && score < 0) r.bad.push({ title: 'พลังอ่อน', avoid: 'ไม่เหมาะเป็นห้องหลัก ใช้เป็นห้องเก็บของ ห้องน้ำ หรือบันไดได้', why: `ดาวน้ำ ${f} · ดาวภูเขา ${m} ไม่ใช่ดาวรุ่ง` });
    return r;
}

// สรุปทั้งบ้าน: house = { facing }, period = ยุคผัง, year = ปีฮวงจุ้ย, kua = เลข Kua เจ้าของ (ไม่มี = 0)
function houseSummary(facing, period, year, kua) {
    const C = houseCurrentPeriod(year);
    const annual = wrap9((2000 - year) % 9);
    const ch = houseChart(facing, period, annual, C);
    const pals = [0, 1, 2, 3, 4, 5, 6, 7].map(p => simplePalace(ch, p, kua));
    // ---------- ดาว 1–5 ----------
    const reasons = [];
    let raw = 3.3;
    // ผังพิเศษ: ดี +0.7 · ร้าย −0.6 · 雙星到向 +0.3 (หน้าบ้านโล่งจะได้ประโยชน์) · 雙星到坐 +0.1
    // บ้านสร้างยุคก่อน: ผังดีของยุคที่สร้างให้ผลน้อยลงเพราะดาวของยุคนั้นถอยแล้ว
    const old = ch.P !== C, gf = old ? 0.4 : 1;
    const pat = ch.pat.reduce((s, x) => s + (x.k === 'good' ? 0.7 * gf : x.k === 'bad' ? -0.6 : (x.c === '雙星到向' ? 0.3 : 0.1) * gf), 0);
    raw += Math.max(-1.5, Math.min(1.5, pat));
    const wF = ch.ft.g[ch.f.palace], mS = ch.mt.g[ch.s.palace];
    const kF = houseTimeliness(wF, C).k, kS = houseTimeliness(mS, C).k;
    raw += { wang: 0.6, sheng: 0.3, tui: 0, shuai: -0.3, sha: -0.6 }[kF];
    raw += { wang: 0.5, sheng: 0.25, tui: 0, shuai: -0.25, sha: -0.5 }[kS];
    if (SIMPLE_GOOD(kF)) reasons.push({ ok: true, t: 'พลังเงินอยู่หน้าบ้าน', cn: '向星' });
    else reasons.push({ ok: false, t: 'หน้าบ้านพลังเงินอ่อน', cn: '向星' });
    if (SIMPLE_GOOD(kS)) reasons.push({ ok: true, t: 'หลังบ้านหนุนสุขภาพและคนในบ้าน', cn: '山星' });
    else reasons.push({ ok: false, t: 'หลังบ้านพลังคนอ่อน ควรมีผนังทึบหรือของสูงหนุน', cn: '山星' });
    ch.pat.forEach(x => { if (x.k !== 'mid') reasons.push({ ok: x.k === 'good', t: x.th + (x.k === 'good' && old ? ` (ของยุค ${ch.P} ผลลดลงแล้ว)` : ''), cn: x.c }); });
    if (old) reasons.push({ ok: false, t: `บ้านสร้างยุค ${ch.P} ตอนนี้ยุค ${C} พลังของยุคเดิมถอยแล้ว การรีโนเวทใหญ่ช่วยเปลี่ยนเป็นบ้านยุคใหม่ได้`, cn: `${ch.P}運→${C}運` });
    const mean = pals.reduce((s, x) => s + SIMPLE_TL[x.tm] + SIMPLE_TL[x.tf], 0) / 8;
    raw += mean * 0.25;
    if (kua) {
        const eastHouse = [0, 2, 3, 4].includes(ch.s.palace), eastMan = personIsEast(kua);
        raw += eastHouse === eastMan ? 0.3 : -0.3;
        reasons.push({ ok: eastHouse === eastMan, t: eastHouse === eastMan ? 'บ้านเข้ากับเจ้าของบ้าน (กลุ่มทิศเดียวกัน)' : 'บ้านกับเจ้าของบ้านอยู่คนละกลุ่มทิศ ใช้ทิศดีของเจ้าของช่วย', cn: '東西四宅' });
    }
    const line = houseDownLine(facing);
    if (line) { raw -= 0.75; reasons.push({ ok: false, t: `ทิศหน้าบ้านตกเส้นอันตราย ควรวัดซ้ำหลายจุด`, cn: line.cn }); }
    const stars = Math.max(1, Math.min(5, Math.round(raw * 2) / 2));
    // ---------- จุดเด่น / จุดต้องแก้ ----------
    const goods = pals.filter(x => x.good && !x.bad.some(b => b.cn === '五黃')).sort((x, y) => y.score - x.score).slice(0, 3);
    const bads = pals.filter(x => x.bad.length && !goods.includes(x)).sort((x, y) => x.score - y.score).slice(0, 3);
    // ---------- ปีนี้ ----------
    const gz = ((year - 4) % 60 + 60) % 60, yz = gz % 12;
    const palOf = (n) => ch.an.g.indexOf(n);
    const sha3 = [8, 0, 4].includes(yz) ? 4 : [5, 9, 1].includes(yz) ? 2 : [2, 6, 10].includes(yz) ? 0 : 6;
    const tai = SIMPLE_ZHI_PAL[yz], po = SIMPLE_ZHI_PAL[(yz + 6) % 12];
    const yearBad = [
        { p: palOf(5), title: 'ห้ามซ่อม ต่อเติม เจาะ ทุบ', t: 'เคราะห์แรงที่สุดของปี', cn: '五黃', fix: REMEDY[5] },
        { p: palOf(2), title: 'ระวังเจ็บป่วย', t: 'ไม่เหมาะเป็นห้องนอนผู้สูงอายุ', cn: '二黑', fix: REMEDY[2] },
        { p: palOf(3), title: 'ระวังทะเลาะ ปากเสียง', t: 'ลดความขัดแย้งด้วยสีแดง', cn: '三碧', fix: REMEDY[3] },
        { p: sha3, title: 'ไม่ควรซ่อมหรือนั่งหันหลังให้', t: 'ทิศอสูรประจำปี', cn: '三煞' },
        { p: tai, title: 'ไม่ควรซ่อมหรือนั่งหันหน้าเข้าหา', t: 'ทิศไท้ส่วยประจำปี', cn: '太歲' },
        { p: po, title: 'ไม่ควรซ่อม', t: 'ทิศตรงข้ามไท้ส่วย (ทิศแตก)', cn: '歲破' }
    ];
    const yearGood = [
        { p: palOf(8), title: 'โชคลาภ ทรัพย์สิน', cn: '八白', fix: REMEDY[8] },
        { p: palOf(9), title: 'งานมงคล ชื่อเสียง', cn: '九紫', fix: REMEDY[9] },
        { p: palOf(1), title: 'การงาน เงินเข้า', cn: '一白', fix: REMEDY[1] },
        { p: palOf(4), title: 'การเรียน ความรัก', cn: '四綠', fix: REMEDY[4] }
    ].filter(x => x.p >= 0);
    // ---------- ทิศดีของเจ้าของบ้าน ----------
    let person = null;
    if (kua) {
        const row = PERSON_8M_TABLE[kua];
        person = { kua, east: personIsEast(kua), list: [0, 1, 2, 7].map(i => ({ code: row[i], p: HOUSE_PALACES.indexOf(row[i]), c: PERSON_8M_ORDER[i], ...PERSON_8M_INFO[PERSON_8M_ORDER[i]] })) };
    }
    return { ch, C, annual, year, stars, rating: SIMPLE_RATING[Math.floor(stars)], raw, reasons, pals, goods, bads, yearBad: yearBad.filter(x => x.p >= 0), yearGood, person, line };
}
