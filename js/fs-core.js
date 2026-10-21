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
    return { c: center, g };
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
function houseChart(facing, period, annualCenter) {
    const f = houseMountainOf(facing), s = houseMountainOf(facing + 180);
    const base = houseFly(period, true);
    const sNum = base.g[s.palace], fNum = base.g[f.palace];
    const mt = houseFly(sNum, houseStarForward(sNum, s.pos, period));
    const ft = houseFly(fNum, houseStarForward(fNum, f.pos, period));
    const an = houseFly(annualCenter, true);
    const P = period, pat = [];
    if (mt.g[s.palace] === P && ft.g[f.palace] === P) pat.push({ k: 'good', c: '旺山旺向', t: 'ดาวภูเขารุ่งอยู่หลังบ้าน ดาวน้ำรุ่งอยู่หน้าบ้าน เป็นผังดี' });
    if (mt.g[f.palace] === P && ft.g[s.palace] === P) pat.push({ k: 'bad', c: '上山下水', t: 'ดาวภูเขาไปอยู่หน้าบ้าน ดาวน้ำไปอยู่หลังบ้าน ต้องแก้ด้วยการจัดวาง' });
    if (mt.g[f.palace] === P && ft.g[f.palace] === P) pat.push({ k: 'mid', c: '雙星到向', t: 'ดาวรุ่งทั้งสองอยู่หน้าบ้าน เหมาะมีที่โล่งและน้ำด้านหน้า' });
    if (mt.g[s.palace] === P && ft.g[s.palace] === P) pat.push({ k: 'mid', c: '雙星到坐', t: 'ดาวรุ่งทั้งสองอยู่หลังบ้าน เหมาะมีภูเขาหรือตึกและน้ำด้านหลัง' });
    return { f, s, base, mt, ft, an, P, pat };
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
