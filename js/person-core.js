// แกนข้อมูลดวงบุคคล (ใช้ร่วมกันระหว่างหน้าเข็มทิศและหน้าวิเคราะห์บ้าน): ตาราง 八宅 และเลข Kua
// เลข Kua คำนวณใน calc.js (สูตรเดียวกับ APK: ใช้ปีที่เปลี่ยนตาม 立春)
// ตาราง 八宅 เป็นตารางมาตรฐาน (ไม่มีใน APK ตัวนี้)

// ดาว 8 ทิศของแต่ละเลข Kua: ลำดับ 生氣 天醫 延年 伏位 禍害 六煞 五鬼 絕命
const PERSON_8M_ORDER = ['生氣', '天醫', '延年', '伏位', '禍害', '六煞', '五鬼', '絕命'];
const PERSON_8M_TABLE = {
    1: ['SE', 'E', 'S', 'N', 'W', 'NW', 'NE', 'SW'],
    2: ['NE', 'W', 'NW', 'SW', 'E', 'S', 'SE', 'N'],
    3: ['S', 'N', 'SE', 'E', 'SW', 'NE', 'NW', 'W'],
    4: ['N', 'S', 'E', 'SE', 'NW', 'W', 'SW', 'NE'],
    6: ['W', 'NE', 'SW', 'NW', 'SE', 'N', 'E', 'S'],
    7: ['NW', 'SW', 'NE', 'W', 'N', 'SE', 'S', 'E'],
    8: ['SW', 'NW', 'W', 'NE', 'S', 'E', 'N', 'SE'],
    9: ['E', 'SE', 'N', 'S', 'NE', 'SW', 'W', 'NW']
};
const PERSON_8M_INFO = {
    '生氣': { th: 'โชคลาภ ความสำเร็จ', rank: 1, good: true, tip: 'ดีที่สุด เหมาะหันโต๊ะทำงาน/ประตูหลัก' },
    '天醫': { th: 'สุขภาพ ผู้อุปถัมภ์', rank: 2, good: true, tip: 'เหมาะหันหัวเตียงเมื่อต้องการพักฟื้น' },
    '延年': { th: 'ความรัก ความสัมพันธ์', rank: 3, good: true, tip: 'เหมาะห้องนอนคู่ ส่งเสริมความรักใคร่' },
    '伏位': { th: 'ความมั่นคง สงบ', rank: 4, good: true, tip: 'เหมาะทำสมาธิ อ่านหนังสือ' },
    '禍害': { th: 'อุปสรรค เรื่องจุกจิก', rank: 5, good: false, tip: 'ร้ายน้อย ใช้เป็นห้องเก็บของได้' },
    '六煞': { th: 'ทะเลาะ เรื่องชู้สาว', rank: 6, good: false, tip: 'เลี่ยงหันหัวเตียงหรือโต๊ะทำงาน' },
    '五鬼': { th: 'ไฟไหม้ ลักขโมย นินทา', rank: 7, good: false, tip: 'เลี่ยงหันประตูหลักหรือโต๊ะทำงาน' },
    '絕命': { th: 'ร้ายที่สุด เจ็บป่วย เสียทรัพย์', rank: 8, good: false, tip: 'เลี่ยงที่สุด ไม่ควรเป็นห้องนอน' }
};
const PERSON_KUA_TRIGRAM = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 6: '乾', 7: '兌', 8: '艮', 9: '離' };
const PERSON_DIR_TH = { N: 'เหนือ', NE: 'อีสาน', E: 'ตะวันออก', SE: 'อาคเนย์', S: 'ใต้', SW: 'หรดี', W: 'ตะวันตก', NW: 'พายัพ' };
const PERSON_EL_ORDER = ['ไม้', 'ไฟ', 'ดิน', 'ทอง', 'น้ำ'];
const PERSON_EL_COLOR = { 'ไม้': 'bg-emerald-500', 'ไฟ': 'bg-red-500', 'ดิน': 'bg-amber-500', 'ทอง': 'bg-slate-300', 'น้ำ': 'bg-blue-500' };
const PERSON_EL_TEXT = { 'ไม้': 'text-emerald-400', 'ไฟ': 'text-red-400', 'ดิน': 'text-amber-400', 'ทอง': 'text-slate-200', 'น้ำ': 'text-blue-400' };

// ดาวของบุคคลในทิศ dirCode (N, NE, ...)
function personStarOf(dirCode, kua) {
    const row = PERSON_8M_TABLE[kua || (typeof state !== 'undefined' ? state.calc.kua : 0)];
    if (!row) return null;
    const c = PERSON_8M_ORDER[row.indexOf(dirCode)];
    return c ? { c, ...PERSON_8M_INFO[c] } : null;
}

// เลข Kua จากปีฮวงจุ้ย (นับปีที่ 立春) และเพศ: สูตรเดียวกับ calc.js และ APK
function personKuaOf(solarYear, gender) {
    let sum = String(solarYear).split('').reduce((a, b) => a + parseInt(b, 10), 0);
    while (sum > 9) sum = String(sum).split('').reduce((a, b) => a + parseInt(b, 10), 0);
    let kua = gender === 'M' ? 11 - sum : 4 + sum;
    if (kua > 9) kua -= 9;
    if (kua === 5) kua = gender === 'M' ? 2 : 8;
    return kua;
}
const personIsEast = (kua) => [1, 3, 4, 9].includes(kua);
// ทิศที่หายไปจากบ้าน (缺角) กระทบสมาชิกตามตรีโกณของวังนั้น
const PERSON_FAMILY_OF_PALACE = { N: 'ลูกชายคนกลาง', NE: 'ลูกชายคนเล็ก', E: 'ลูกชายคนโต', SE: 'ลูกสาวคนโต', S: 'ลูกสาวคนกลาง', SW: 'แม่/ภรรยา', W: 'ลูกสาวคนเล็ก', NW: 'พ่อ/ผู้นำบ้าน' };
const PERSON_TRIGRAM_OF_PALACE = { N: '坎', NE: '艮', E: '震', SE: '巽', S: '離', SW: '坤', W: '兌', NW: '乾' };
