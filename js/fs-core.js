// แกนคำนวณดาวเหินของบ้าน (ใช้ร่วมกันระหว่างหน้าเข็มทิศ index.html และหน้าวิเคราะห์บ้าน plan.html)
// ไม่มีโค้ดที่ผูกกับหน้าจอ: ข้อมูล สูตร และทิศบ้านที่บันทึกไว้ (localStorage: luopan_house)
// ดาวเหินของบ้าน (玄空飛星 下卦): ผังดาวภูเขา/ดาวน้ำตามทิศนั่ง-หันและยุคที่สร้าง
// ตรวจกับตาราง StarTab ของแอปต้นแบบ (APK Thai_F12_LuoPan) แล้ว ตรงกันครบ 9 ยุค × 24 ภูเขา (คอลัมน์มาตรฐาน)
// ยังไม่รวมผังทดแทน (替卦) สำหรับทิศที่ตกช่วง 兼 แอปจะเตือนแทน

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
// period = ยุคของผังบ้าน · C = ยุคปัจจุบัน (ไม่ส่งมา = ใช้ยุคของผัง)
function houseChart(facing, period, annualCenter, C) {
    const f = houseMountainOf(facing), s = houseMountainOf(facing + 180);
    const base = houseFly(period, true);
    const sNum = base.g[s.palace], fNum = base.g[f.palace];
    const mt = houseFly(sNum, houseStarForward(sNum, s.pos, period));
    const ft = houseFly(fNum, houseStarForward(fNum, f.pos, period));
    const an = houseFly(annualCenter, true);
    const ch = { f, s, base, mt, ft, an, P: period, C: C || period };
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
function houseWarning(facing) {
    const f = houseMountainOf(facing);
    if (f.dist <= 1.5) return f.pdist <= 1.5 ? '⚠️ ทิศหน้าบ้านตกเส้นแบ่งกัว (大空亡) ควรวัดซ้ำหลายจุด' : '⚠️ ทิศหน้าบ้านตกเส้นแบ่งภูเขา (小空亡) ควรวัดซ้ำหลายจุด';
    if (f.dist <= 3) return '⚠️ ทิศอยู่ช่วง 兼 (ห่างเส้นแบ่ง ' + f.dist.toFixed(1) + '°) บางสำนักใช้ผังทดแทน (替卦)';
    return '';
}
