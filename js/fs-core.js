// แกนคำนวณดาวเหินของบ้าน (ใช้ร่วมกันระหว่างหน้าเข็มทิศ index.html และหน้าวิเคราะห์บ้าน plan.html)
// ไม่มีโค้ดที่ผูกกับหน้าจอ: ข้อมูล สูตร และทิศบ้านที่บันทึกไว้ (localStorage: luopan_house)
// ดาวเหินของบ้าน (玄空飛星 下卦): ผังดาวภูเขา/ดาวน้ำตามทิศนั่ง-หันและยุคที่สร้าง
// ตรวจกับตาราง StarTab ของแอปต้นแบบ (APK Thai_F12_LuoPan) แล้ว ตรงกันครบ 9 ยุค × 24 ภูเขา (คอลัมน์มาตรฐาน)
// ผังทดแทน (替卦) เป็นตัวเลือก (luopan_tigua) ใช้เมื่อทิศอยู่ริมภูเขา ≤ 3° ตามแอป F04 · ตรงตาราง StarOP 212/216 อีก 4 ผังใช้ค่าตาม APK

// ---------- ข้อมูล ----------
// 24 ภูเขา เริ่มที่ 壬 (337.5°–352.5°) เรียงตามเข็มนาฬิกา
const HOUSE_M24 = ['壬','子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥'];
const HOUSE_M24_TH = ['เหริน','ชวด','กุ่ย','ฉลู','เกิน','ขาล','เจี่ย','เถาะ','อี้','มะโรง','ซวิ่น','มะเส็ง','ปิ่ง','มะเมีย','ติง','มะแม','คุน','วอก','เกิง','ระกา','ซิน','จอ','เฉียน','กุน'];
// วังทั้ง 8 เริ่มที่ทิศเหนือตามเข็มนาฬิกา
const HOUSE_PALACES = ['N','NE','E','SE','S','SW','W','NW'];
const HOUSE_PALACE_TH = ['เหนือ','ตะวันออกเฉียงเหนือ','ตะวันออก','ตะวันออกเฉียงใต้','ใต้','ตะวันตกเฉียงใต้','ตะวันตก','ตะวันตกเฉียงเหนือ'];
const HOUSE_PALACE_SHORT = ['เหนือ','อีสาน','ตะวันออก','อาคเนย์','ใต้','หรดี','ตะวันตก','พายัพ'];
// เส้นทางเหินของลั่วซู: กลาง -> NW -> W -> NE -> S -> N -> SW -> E -> SE
const HOUSE_FLY_PATH = [null, 7, 6, 1, 4, 0, 5, 2, 3];
const HOUSE_HOME = { 1: 0, 2: 5, 3: 2, 4: 3, 6: 7, 7: 6, 8: 1, 9: 4 };
const HOUSE_STAR_NAME = [null, '一白 贪狼', '二黑 巨門', '三碧 祿存', '四綠 文曲', '五黃 廉貞', '六白 武曲', '七赤 破軍', '八白 左輔', '九紫 右弼'];
const HOUSE_STAR_MEAN = [null, 'การงาน ความก้าวหน้า', 'สุขภาพ โรคภัย', 'ทะเลาะ คดีความ', 'การเรียน ความรัก', 'เคราะห์ร้าย อุบัติเหตุ', 'อำนาจ ผู้ใหญ่อุปถัมภ์', 'ปากเสียง ลักขโมย', 'ทรัพย์สิน ความมั่นคง', 'ชื่อเสียง งานมงคล'];

// ---------- คำนวณ ----------
const houseNorm360 = (d) => ((d % 360) + 360) % 360;
const wrap9 = (n) => ((n - 1) % 9 + 9) % 9 + 1;
function houseFly(center, forward) {
    const g = new Array(8);
    for (let k = 1; k < 9; k++) g[HOUSE_FLY_PATH[k]] = wrap9(forward ? center + k : center - k);
    return { c: center, g, fw: forward };
}
// ภูเขาในวังทิศหลัก (เหนือ ตะวันออก ใต้ ตะวันตก) ตำแหน่งแรกเป็นหยาง ที่เหลือหยิน; วังทิศเฉียงกลับกัน
const houseMountainYang = (palace, pos) => (palace % 2 === 0) ? pos === 0 : pos !== 0;
function houseStarForward(num, pos, period) {
    const n = num === 5 ? period : num;      // ดาว 5 ยืมวังของเลขยุค
    if (n === 5) return true;
    return houseMountainYang(HOUSE_HOME[n], pos);
}
// ภูเขาของทิศ d: index (0 = 壬), วัง, ตำแหน่งในวัง (0 地元 / 1 天元 / 2 人元), ระยะถึงเส้นแบ่ง
function houseMountainOf(d) {
    d = houseNorm360(d);
    const m = Math.floor(houseNorm360(d + 22.5) / 15) % 24;
    const off = houseNorm360(d + 22.5) % 15, dist = Math.min(off, 15 - off);
    const poff = houseNorm360(d + 22.5) % 45, pdist = Math.min(poff, 45 - poff);
    return { m, palace: Math.floor(m / 3), pos: m % 3, dist, pdist, toPrev: off < 7.5 };
}
function housePeriodOf(year) { const k = Math.floor((year - 1864) / 20); return ((k % 9) + 9) % 9 + 1; }
function housePeriodRange(p) { let s = 1864 + (p - 1) * 20; if (s + 20 <= 1984) s += 180; return [s, s + 19]; }
function houseTimeliness(n, P) {
    if (n === 5 && P !== 5) return { k: 'sha', th: 'ร้าย' };
    if (n === P) return { k: 'wang', th: 'รุ่ง' };
    if (n === wrap9(P + 1) || n === wrap9(P + 2)) return { k: 'sheng', th: 'กำลังมา' };
    if (n === wrap9(P - 1)) return { k: 'tui', th: 'ถอย' };
    return { k: 'shuai', th: 'อ่อน' };
}
// ยุคปัจจุบันตามวันที่ (ปีฮวงจุ้ยเปลี่ยนที่ 立春) ใช้ตัดสินดาวรุ่ง/ถอย และดาวถูกล็อค (เหมือน APK F04)
function houseCurrentPeriod(solarYear) { return housePeriodOf(solarYear); }

// ดาวจรเดือน (ดาวกลาง) จากกิ่งปีและกิ่งเดือน (0 = 子) ตารางเดียวกับ CalDateStar ของ APK
const HOUSE_MONTH_STAR = [[7, 6, 8, 7, 6, 5, 4, 3, 2, 1, 9, 8], [4, 3, 5, 4, 3, 2, 1, 9, 8, 7, 6, 5], [1, 9, 2, 1, 9, 8, 7, 6, 5, 4, 3, 2]];
function houseMonthStar(yearZhi, monthZhi) { return HOUSE_MONTH_STAR[yearZhi % 3][monthZhi]; }

// สภาพของทิศบ้าน: ลำดับตรวจและชื่อตาม ChkCond / TxtStarsCond ของ APK (บารมี = ดาวภูเขา, ลาภ = ดาวน้ำ)
const HOUSE_COND = [
    null,
    { k: 'good', c: '旺山旺向', th: 'ทิศมีบารมีและลาภ', t: 'ดาวภูเขารุ่งอยู่หลังบ้าน ดาวน้ำรุ่งอยู่หน้าบ้าน ผังดีทั้งคนและเงิน' },
    { k: 'good', c: '旺向', th: 'ทิศมีลาภ', t: 'ดาวน้ำรุ่งอยู่หน้าบ้าน ดีเรื่องเงิน ส่วนดาวภูเขารุ่งไม่ได้อยู่หลังบ้าน' },
    { k: 'mid', c: '雙星到坐', th: 'ทิศลาภหนุนบารมี', t: 'ดาวรุ่งทั้งสองอยู่หลังบ้าน หลังบ้านควรมีทั้งที่สูงและน้ำ/ที่โล่ง' },
    { k: 'good', c: '旺山', th: 'ทิศมีบารมี', t: 'ดาวภูเขารุ่งอยู่หลังบ้าน ดีเรื่องคนและสุขภาพ ส่วนดาวน้ำรุ่งไม่ได้อยู่หน้าบ้าน' },
    { k: 'mid', c: '雙星到向', th: 'ทิศบารมีหนุนลาภ', t: 'ดาวรุ่งทั้งสองอยู่หน้าบ้าน หน้าบ้านควรมีทั้งที่โล่ง/น้ำ และที่สูงไกลออกไป' },
    { k: 'bad', c: '上山下水', th: 'ทิศล้มเหลว', t: 'ดาวภูเขารุ่งไปอยู่หน้าบ้าน ดาวน้ำรุ่งไปอยู่หลังบ้าน ต้องแก้ด้วยการจัดวาง' },
    { k: 'bad', c: '山星入中', th: 'ทิศบารมีเข้ากลาง', t: 'ดาวภูเขาของยุคอยู่กลางบ้าน' },
    { k: 'bad', c: '向星入中', th: 'ทิศลาภเข้ากลาง', t: 'ดาวน้ำของยุคอยู่กลางบ้าน' },
    { k: 'bad', c: '山向入中', th: 'ทิศบารมีและลาภเข้ากลาง', t: 'ดาวภูเขาและดาวน้ำของยุคอยู่กลางบ้าน' }
];
function houseCond(ch) {
    const P = ch.P, mS = ch.mt.g[ch.s.palace], mF = ch.mt.g[ch.f.palace], wS = ch.ft.g[ch.s.palace], wF = ch.ft.g[ch.f.palace];
    if (mS === P && wF === P) return 1;
    if (mS === P && wS === P) return 3;
    if (mF === P && wF === P) return 5;
    if (wF === P) return 2;
    if (mS === P) return 4;
    if (mF === P && wS === P) return 6;
    if (ch.mt.c === P && ch.ft.c === P) return 9;
    if (ch.mt.c === P) return 7;
    if (ch.ft.c === P) return 8;
    return 0;
}
// ผังพิเศษทั้งผัง (ตามรายการ TxtR04SpecType ของ APK F04) C = ยุคปัจจุบัน
function houseSpecials(ch, C) {
    const cells = [{ m: ch.mt.c, f: ch.ft.c, b: ch.base.c }].concat(ch.mt.g.map((m, i) => ({ m, f: ch.ft.g[i], b: ch.base.g[i] })));
    const all = (fn) => cells.every(fn);
    const trio = (x) => { const a = [x.b, x.f, x.m]; return a[1] === wrap9(a[0] + 3) && a[2] === wrap9(a[0] + 6) || a[1] === wrap9(a[0] + 6) && a[2] === wrap9(a[0] + 3); };
    const serial = (x) => { const a = [x.b, x.f, x.m]; return a.some((v, i) => { const r = a.filter((_, j) => j !== i); return r.includes(wrap9(v + 1)) && r.includes(wrap9(v + 2)); }); };
    const out = [];
    if (all(x => x.b + x.f === 10)) out.push({ k: 'good', c: '合十 (向)', th: 'ภาคี 10 เสริมโชค', t: 'ดาวยุคกับดาวน้ำรวมกันได้ 10 ทุกช่อง ส่งเสริมเงินและความรุ่งเรือง' });
    if (all(x => x.b + x.m === 10)) out.push({ k: 'good', c: '合十 (山)', th: 'ภาคี 10 เสริมคน', t: 'ดาวยุคกับดาวภูเขารวมกันได้ 10 ทุกช่อง ส่งเสริมคน สุขภาพ และผู้อุปถัมภ์' });
    if (all(trio)) out.push({ k: 'good', c: '父母三般卦', th: 'ผังดาวไตรภาคี', t: 'ทุกช่องเป็นชุด 1-4-7 / 2-5-8 / 3-6-9 ดาวของยุคต้น กลาง ปลายเชื่อมกัน' });
    if (all(serial)) out.push({ k: 'good', c: '連珠三般卦', th: 'ผังดาวเรียงตัว', t: 'ทุกช่องเป็นเลขเรียงกัน 3 ตัว พลังต่อเนื่องกันทั้งผัง' });
    if (ch.mt.c === 5) out.push({ k: 'bad', c: '五黃入中 (山)', th: 'ผังดาว 5 ภูเขาเข้ากลาง', t: 'ดาว 5 ภูเขาอยู่กลางบ้าน เมื่อพลังของยุคเข้าบ้านไม่ได้จะเกิดเรื่องร้ายกับคนในบ้าน' });
    if (ch.ft.c === 5) out.push({ k: 'bad', c: '五黃入中 (向)', th: 'ผังดาว 5 ลาภวิบัติเข้ากลาง', t: 'ดาว 5 น้ำอยู่กลางบ้าน เมื่อพลังของยุคเข้าบ้านไม่ได้จะเสียหายเรื่องเงิน' });
    if (ch.mt.c === C && ch.ft.c === C) out.push({ k: 'bad', c: '入囚', th: 'ดาวบารมีและโชคประจำยุคถูกล็อค', t: `ดาวภูเขาและดาวน้ำเลข ${C} (ยุคปัจจุบัน) ติดอยู่กลางบ้าน แก้โดยเปิดโล่งจากกลางบ้านไปถึงประตู/หน้าต่าง` });
    else if (ch.ft.c === C) out.push({ k: 'bad', c: '入囚 (向)', th: 'ผังดาวโชคประจำยุคถูกล็อค', t: `ดาวน้ำเลข ${C} (ยุคปัจจุบัน) ติดอยู่กลางบ้าน กระทบเงินและธุรกิจ แก้โดยเปิดโล่งจากกลางบ้านไปถึงประตู/หน้าต่าง` });
    else if (ch.mt.c === C) out.push({ k: 'bad', c: '入囚 (山)', th: 'ผังดาวบารมีประจำยุคถูกล็อค', t: `ดาวภูเขาเลข ${C} (ยุคปัจจุบัน) ติดอยู่กลางบ้าน กระทบสุขภาพและคนในบ้าน แก้โดยเปิดโล่งจากกลางบ้าน` });
    if (ch.mt.c === ch.ft.c && ch.mt.fw && ch.ft.fw) out.push({ k: 'bad', c: '伏吟', th: 'ผังดาวหกงิ้ม (ภูเขา-น้ำ)', t: 'ดาวภูเขาและดาวน้ำทับกันและเดินหน้าทั้งผัง' });
    if (ch.mt.c === ch.base.c && ch.mt.fw) out.push({ k: 'bad', c: '伏吟', th: 'ผังดาวหกงิ้ม (ภูเขา-ยุค)', t: 'ดาวภูเขาทับดาวยุคและเดินหน้าทั้งผัง' });
    if (ch.ft.c === ch.base.c && ch.ft.fw) out.push({ k: 'bad', c: '伏吟', th: 'ผังดาวหกงิ้ม (น้ำ-ยุค)', t: 'ดาวน้ำทับดาวยุคและเดินหน้าทั้งผัง' });
    return out;
}
// ---------- ผังทดแทน (替卦) สูตรสาย อ.เสิ้น (沈氏) ----------
// เลขดาวกลางของดาวภูเขา/ดาวน้ำ เปลี่ยนเป็น "ดาวแทน" ของภูเขาตำแหน่งเดียวกัน (地/天/人元) ในวังบ้านเกิดของเลขนั้น
// ทิศบินคงเดิมตามผังปกติ · เลข 5 ไม่แทน · ดาวแทนของ 24 ภูเขา (เรียงตาม HOUSE_M24):
const HOUSE_TI_STAR = [2, 1, 1, 7, 7, 9, 1, 2, 2, 6, 6, 6, 7, 9, 9, 2, 2, 1, 9, 7, 7, 6, 6, 6];
// 4 ผังที่ตาราง StarOP ของ APK ต่างจากสูตร (ยุค-ภูเขานั่ง): ใช้ค่าตาม APK · ลบ = บินถอยหลัง · m = ดาวภูเขา, w = ดาวน้ำ
const HOUSE_TI_EXC = { '4-15': { m: -2 }, '5-5': { m: -9 }, '5-6': { w: -9 }, '8-17': { m: 6 } };
const HOUSE_TI_BAND = 3;     // ห่างเส้นแบ่งภูเขาไม่เกินกี่องศาจึงใช้ผังทดแทน (เหมือน F04)
let HOUSE_TI = false;        // ตัวเลือกของผู้ใช้ ค่าเริ่มต้นปิด (F04 เริ่มที่ผังปกติ)
try { HOUSE_TI = localStorage.getItem('luopan_tigua') === '1'; } catch (e) {}
function houseTiSet(on) { HOUSE_TI = !!on; try { localStorage.setItem('luopan_tigua', on ? '1' : '0'); } catch (e) {} }
function houseTiCenter(num, pos) { return num === 5 ? 5 : HOUSE_TI_STAR[HOUSE_HOME[num] * 3 + pos]; }

// period = ยุคของผังบ้าน · C = ยุคปัจจุบัน (ไม่ส่งมา = ใช้ยุคของผัง) · ti = ใช้ผังทดแทน (ไม่ส่งมา = ตามตัวเลือกของผู้ใช้)
function houseChart(facing, period, annualCenter, C, ti) {
    const f = houseMountainOf(facing), s = houseMountainOf(facing + 180);
    const base = houseFly(period, true);
    const sNum = base.g[s.palace], fNum = base.g[f.palace];
    const sFw = houseStarForward(sNum, s.pos, period), fFw = houseStarForward(fNum, f.pos, period);
    let mt = houseFly(sNum, sFw), ft = houseFly(fNum, fFw), tiInfo = null;
    if ((ti === undefined ? HOUSE_TI : ti) && f.dist <= HOUSE_TI_BAND) {
        const ex = HOUSE_TI_EXC[period + '-' + s.m] || {};
        const mt2 = ex.m ? houseFly(Math.abs(ex.m), ex.m > 0) : houseFly(houseTiCenter(sNum, s.pos), sFw);
        const ft2 = ex.w ? houseFly(Math.abs(ex.w), ex.w > 0) : houseFly(houseTiCenter(fNum, f.pos), fFw);
        tiInfo = { std: { m: sNum, w: fNum }, same: mt2.c === mt.c && mt2.fw === mt.fw && ft2.c === ft.c && ft2.fw === ft.fw };
        mt = mt2; ft = ft2;
    }
    const an = houseFly(annualCenter, true);
    const ch = { f, s, base, mt, ft, an, P: period, C: C || period, ti: tiInfo };
    ch.cond = houseCond(ch);
    ch.spec = houseSpecials(ch, ch.C);
    ch.pat = (ch.cond ? [HOUSE_COND[ch.cond]] : []).concat(ch.spec);
    return ch;
}

// ---------- ข้อมูลบ้านที่บันทึกไว้ ----------
let house = null;            // { facing, year, period: 'auto' | 1..9, savedAt }
try { house = JSON.parse(localStorage.getItem('luopan_house') || 'null'); } catch (e) { house = null; }
function houseSave() { try { localStorage.setItem('luopan_house', JSON.stringify(house)); } catch (e) {} }
function housePeriod() { return !house ? 9 : (house.period === 'auto' ? housePeriodOf(house.year) : +house.period); }
// ---------- เส้นองศาอันตราย 5 แบบ (ตาม ChkDownAngle ของ APK ดาวเหิน F04) ----------
// แต่ละเส้นกว้าง 0.5–1° · ตรวจตามลำดับ ชนิดหลังทับชนิดแรก (เหมือน APK) · ความหมายเขียนสรุปเอง
const HOUSE_LINES = [
    { th: 'เส้นคงฮ้ง', cn: '空亡', t: 'รอยต่อระหว่างภูเขา 2 ลูก พลังไม่ชัด ไร้กำลัง ผลดีร้ายคลุมเครือ' },
    { th: 'เส้นเขี่ยสัวะ', cn: '大空亡', t: 'รอยต่อของทิศหลัก 8 ทิศ ส่งผลแตกแยก ทะเลาะ หย่าร้าง ลูกน้องหักหลัง การเงินสะดุด' },
    { th: 'เส้นฉุกข่วย', cn: '出卦', t: 'ขอบครึ่งองศาข้างรอยต่อทิศหลัก พลังออกนอกกัว เสี่ยงเรื่องชู้สาว คดีความ' },
    { th: 'เส้นอิมซาเอี้ยงฉ่อ', cn: '陰陽差錯', t: 'ขอบรอยต่อภูเขาที่หยินหยางต่างกัน พลังไม่เสถียร เจริญก่อนแล้วถอย อำนาจวาสนาไม่มั่นคง' },
    { th: 'เส้นเทียงปั้วคงฮ้ง', cn: '天盤空亡', t: 'รอยต่อของวงฟ้า กระทบระบบทางน้ำ ขาดโชคลาภ' }
];
function houseDownLine(deg) {
    const d = houseNorm360(deg);
    const inR = (a, b) => { a = houseNorm360(a); b = houseNorm360(b); return a <= b ? (d >= a && d <= b) : (d >= a || d <= b); };
    let hit = null;
    const test = (type, a, b) => { if (inR(a, b)) hit = { type, a: houseNorm360(a), b: houseNorm360(b), ...HOUSE_LINES[type] }; };
    for (let k = 0; k < 8; k++) { const o = k * 45; test(0, o + 7, o + 8); test(0, o + 37, o + 38); }
    for (let k = 0; k < 8; k++) { const o = k * 45; test(1, o + 22, o + 23); }
    for (let k = 0; k < 8; k++) { const o = k * 45; test(2, o + 338, o + 338.5); test(2, o + 21.5, o + 22); }
    for (let k = 0; k < 8; k++) { const o = k * 45; test(3, o + 36.5, o + 37); test(3, o + 38, o + 38.5); }
    for (let k = 0; k < 12; k++) { const o = k * 30; test(4, o + 14.5, o + 15.5); }
    return hit;
}
function houseWarning(facing) {
    const ln = houseDownLine(facing);
    if (ln) return `⚠️ ทิศหน้าบ้านตก${ln.th} (${ln.cn}) ช่วง ${ln.a}°–${ln.b}°: ${ln.t} · ควรวัดซ้ำหลายจุด`;
    const f = houseMountainOf(facing);
    if (f.dist <= HOUSE_TI_BAND) return '⚠️ ทิศอยู่ช่วง 兼 (ห่างเส้นแบ่งภูเขา ' + f.dist.toFixed(1) + '°) ' + (HOUSE_TI ? 'ใช้ผังทดแทน (替卦) ตามตัวเลือกแล้ว' : 'บางสำนักใช้ผังทดแทน (替卦) เปิดได้ที่ตัวเลือกในตั้งค่าบ้าน');
    return '';
}
// ข้อความสั้นบอกว่าผังนี้ใช้ผังทดแทนหรือไม่ (ว่าง = ผังปกติ)
function houseTiNote(ch) {
    if (!ch || !ch.ti) return '';
    return ch.ti.same ? 'ผังทดแทน (替卦): เลขดาวกลางเหมือนผังปกติ' : `ใช้ผังทดแทน (替卦) · ผังปกติคือ ภูเขา ${ch.ti.std.m} น้ำ ${ch.ti.std.w} → ผังทดแทน ภูเขา ${ch.mt.c} น้ำ ${ch.ft.c}`;
}

// ---------- ประตูเมือง (城門訣) ----------
// วังข้างวังหน้าบ้าน (ซ้าย/ขวา) เป็นวังประตูเมืองได้ ถ้า: เอาดาวยุค (運盤) ของวังนั้นเข้ากลาง บินตามหยินหยางของภูเขาตำแหน่งเดียวกับภูเขาหน้าบ้าน
// (ในวังบ้านเกิดของดาวนั้น เหมือนการบินดาวภูเขา/น้ำ) แล้วดาวประจำยุคบินกลับมาตกที่วังนั้นพอดี · ประตูอยู่ภูเขาตำแหน่งเดียวกับภูเขาหน้าบ้าน
// ตรวจกับตารางประตูเมืองของ APK F04 ตรง 214/216 (ต่าง: ยุค 3 นั่ง 丑, ยุค 5 นั่ง 甲)
function houseGates(ch) {
    const P = ch.P, F = ch.f.palace, pos = ch.f.pos, out = [];
    [(F + 7) % 8, (F + 1) % 8].forEach(G => {
        const b = ch.base.g[G], fl = houseFly(b, houseStarForward(b, pos, P));
        if (fl.g[G] === P) { const m = G * 3 + pos; out.push({ pal: G, m, a: houseNorm360(m * 15 - 15 - 7.5), b: houseNorm360(m * 15 - 15 + 7.5) }); }
    });
    return out;
}

// ---------- 7 ดาวขโมยโชค แบบ 64 ข่วย (七星打劫 玄空大卦) ตาม CalDragon ของ APK F07 ฮวงจุ้ย 64 ข่วย ----------
// วง 64 ข่วยลำดับฝูซี ช่องละ 5.625° เริ่ม 復 ที่ 0° (ตรงกับ FUXI_RING ใน data.js) · มุมที่ใช้คือทิศประตูหน้าบ้าน
// ทิศน้ำ = ตำแหน่งของข่วยกลับหัว (綜卦) ของข่วยหน้าบ้าน · ทิศมังกร = ตรงข้ามทิศน้ำ
// ข่วยที่กลับหัวแล้วเหมือนเดิม 8 ตัว (乾 坤 坎 離 頤 大過 中孚 小過) ไม่มีผังนี้
// ตรีโกณแทนด้วยเลข 3 บิต เส้นล่างเป็นบิตสูง: 坤0 艮1 坎2 巽3 震4 離5 兌6 乾7
const HOUSE_GUA_W = 5.625;
function houseGuaIdx(d) { return Math.floor(houseNorm360(d - 0.001) / HOUSE_GUA_W) % 64; }
function houseGuaTri(i) { const b = i >> 3, j = i & 7; return i < 32 ? { lo: 4 + b, up: j } : { lo: 7 - b, up: 7 - j }; }
function houseGuaFromTri(lo, up) { return lo >= 4 ? (lo - 4) * 8 + up : (7 - lo) * 8 + (7 - up); }
const houseTriRev = (c) => ((c & 1) << 2) | (c & 2) | (c >> 2);
function houseRobbery64(facing) {
    const i = houseGuaIdx(facing), t = houseGuaTri(i);
    const z = houseGuaFromTri(houseTriRev(t.up), houseTriRev(t.lo));
    const at = (k) => ({ k, a: k * HOUSE_GUA_W, b: (k + 1) * HOUSE_GUA_W, mid: (k + 0.5) * HOUSE_GUA_W, kw: typeof FUXI_RING !== 'undefined' ? FUXI_RING[k] : 0 });
    if (z === i) return { door: at(i), none: true };
    return { door: at(i), water: at(z), dragon: at((z + 32) % 64), none: false };
}
// ชื่อข่วยจากเลข King Wen (ใช้ gua64Info ใน data.js ถ้ามี)
function houseGuaName(kw) {
    if (!kw) return '';
    const ch = String.fromCodePoint(0x4DC0 + kw - 1);
    return typeof gua64Info !== 'undefined' && gua64Info[kw - 1] ? ch + ' ' + gua64Info[kw - 1].split('|')[0] : ch;
}

// ---------- 零正神 (ตามรายการในแอป F04: 正神 / 反正神 / 零神 / 反零神) ----------
// 正神 = วังประจำตัวของเลขยุค, 零神 = วังตรงข้าม · ยุคหน้าใช้หลักเดียวกันกับเลขยุคถัดไป
const HOUSE_HOME_PAL = { 1: 0, 2: 5, 3: 2, 4: 3, 6: 7, 7: 6, 8: 1, 9: 4 };
function houseZeroDirs(C) {
    if (C === 5) return [];
    const nxt = C === 9 ? 1 : (C === 4 ? 6 : C + 1);
    const z = HOUSE_HOME_PAL[C], nz = HOUSE_HOME_PAL[nxt];
    return [
        { pal: z, k: 'zheng', th: 'เจี่ยซิ้ง', cn: '正神', out: 'ภายนอกควรมีภูเขา ตึก หรือที่สูง ไม่ควรเจอน้ำ', ins: 'ภายในโปร่ง มีประตู หน้าต่าง ช่องลมรับพลัง', when: `ยุค ${C}` },
        { pal: (z + 4) % 8, k: 'ling', th: 'หลั่งซิ้ง', cn: '零神', out: 'ภายนอกควรมีน้ำ ที่ต่ำ หรือถนน', ins: 'ภายในสงบ ทึบ ไม่เคลื่อนไหว (ยกเว้นตั้งน้ำเพื่อเรียกโชค)', when: `ยุค ${C}` },
        { pal: nz, k: 'nzheng', th: 'หงั่วเจี่ยซิ้ง', cn: '反正神', out: 'เตรียมไว้: ยุคหน้าทิศนี้ควรมีที่สูง', ins: 'ภายในโปร่ง', when: `ยุคหน้า (${nxt})` },
        { pal: (nz + 4) % 8, k: 'nling', th: 'หงั่วหลั่งซิ้ง', cn: '反零神', out: 'เตรียมไว้: ยุคหน้าทิศนี้ควรมีน้ำ/ที่ต่ำ', ins: 'ภายในสงบ', when: `ยุคหน้า (${nxt})` }
    ];
}

// ---------- ดาวจรวัน (ตาม CalDateStar ของ APK) ----------
// ครึ่งปีหยาง (冬至 → 夏至) นับเพิ่มวันละ 1 · ครึ่งปีหยิน (夏至 → 冬至) นับลด · เลขเริ่มจากก้านกิ่งของวันสารท
function houseSolsticeDay(year, lon) {
    // หาเวลาที่ลองจิจูดดวงอาทิตย์ = lon (90 หรือ 270) ด้วยการแบ่งครึ่ง แล้วคืนวันที่ท้องถิ่นเวลา 00:00
    const m = lon === 90 ? 5 : 11;
    let lo = new Date(year, m, 15).getTime(), hi = new Date(year, m, 28).getTime();
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; const dl = ((sunLongitude(new Date(mid)) - lon + 540) % 360) - 180; if (dl < 0) lo = mid; else hi = mid; }
    const t = new Date(hi), day = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    if (t.getHours() >= 23) day.setDate(day.getDate() + 1); // หลัง 23:00 นับเป็นวันถัดไป (ยามชวด)
    return day;
}
function houseDayStar(date) {
    const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate()), y = d0.getFullYear();
    const sum = houseSolsticeDay(y, 90), win = houseSolsticeDay(y, 270);
    const yin = d0 >= sum && d0 < win;
    const ref = yin ? sum : (d0 >= win ? win : houseSolsticeDay(y - 1, 270));
    const gz = getManualDayPillar(ref), top = gz.gan + 1, low = gz.zhi + 1;
    let start = ((((top - low) % 12) + 12) % 12 * 5 + top) % 9 || 9;
    if (yin) start = 10 - start;
    const diff = Math.round((d0 - ref) / 86400000);
    return { star: wrap9(yin ? start - diff : start + diff), yin };
}
