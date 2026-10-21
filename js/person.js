// ดวงบุคคลแบบละเอียด (แท็บวิเคราะห์): ทิศมงคล 8 ทิศ (八宅) ธาตุประจำตัว ปีชง และความเข้ากันกับบ้าน
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
    const row = PERSON_8M_TABLE[kua || state.calc.kua];
    if (!row) return null;
    const c = PERSON_8M_ORDER[row.indexOf(dirCode)];
    return c ? { c, ...PERSON_8M_INFO[c] } : null;
}

function renderPersonDetail() {
    const el = document.getElementById('personDetail');
    if (!el || !state.calc.personBazi || !state.calc.personBazi.bazi) return;
    const kua = state.calc.kua, row = PERSON_8M_TABLE[kua];
    const isEast = [1, 3, 4, 9].includes(kua);
    const pb = state.calc.personBazi.bazi, tb = state.calc.timeBazi;

    // 1) สรุปบนสุด
    const dm = ganData[pb.dg];
    const yin = pb.dg % 2 === 1 ? 'หยิน' : 'หยาง';
    const head = `
        <div class="grid grid-cols-2 gap-2 mb-3">
            <div class="bg-slate-900/70 rounded-lg p-2 border border-slate-700 text-center">
                <div class="text-[10px] text-slate-400">เลขประจำตัว (Kua)</div>
                <div class="text-2xl font-black text-yellow-400 leading-tight">${kua} <span class="cn-char text-lg">${PERSON_KUA_TRIGRAM[kua]}</span></div>
                <div class="text-[11px] ${isEast ? 'text-sky-300' : 'text-orange-300'}">กลุ่ม${isEast ? 'ตะวันออก (東四命)' : 'ตะวันตก (西四命)'}</div>
            </div>
            <div class="bg-slate-900/70 rounded-lg p-2 border border-slate-700 text-center">
                <div class="text-[10px] text-slate-400">ธาตุประจำตัว (日主)</div>
                <div class="text-2xl font-black leading-tight ${dm.color} cn-char">${dm.char}</div>
                <div class="text-[11px] ${dm.color}">${dm.el}${yin}</div>
            </div>
        </div>`;

    // 2) ทิศ 8 ทิศ ในผัง 3×3 (ทิศเหนืออยู่บน)
    const layout = ['NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE'];
    const cell = (d) => {
        if (d === 'C') return `<div class="rounded-md bg-slate-900 flex flex-col items-center justify-center p-1">
            <div class="text-[10px] text-slate-400">คุณ</div><div class="text-xl font-black text-yellow-400">${kua}</div></div>`;
        const st = personStarOf(d, kua);
        const tone = st.good
            ? (st.rank === 1 ? 'bg-emerald-600/40 border-emerald-400' : 'bg-emerald-900/40 border-emerald-700')
            : (st.rank === 8 ? 'bg-red-600/40 border-red-400' : 'bg-red-950/50 border-red-800');
        return `<div class="rounded-md border ${tone} p-1 text-center leading-tight">
            <div class="text-[10px] text-slate-300">${d} ${PERSON_DIR_TH[d]}</div>
            <div class="cn-char text-[15px] font-bold ${st.good ? 'text-emerald-300' : 'text-red-300'}">${st.c}</div>
            <div class="text-[10px] ${st.good ? 'text-emerald-100' : 'text-red-100'}">${st.th}</div></div>`;
    };
    const best = row[0], worst = row[7];
    const dirs = `
        <div class="text-[12px] font-semibold text-slate-200 mb-1.5">🧭 ทิศมงคล 8 ทิศของคุณ</div>
        <div class="grid grid-cols-3 gap-1">${layout.map(cell).join('')}</div>
        <div class="mt-2 text-[11px] leading-relaxed text-slate-300">
            <span class="text-emerald-300">✔ ทิศดีที่สุด:</span> ${PERSON_DIR_TH[best]} (生氣) ${PERSON_8M_INFO['生氣'].tip}<br>
            <span class="text-emerald-300">✔ หัวเตียง:</span> ${PERSON_DIR_TH[row[1]]} (天醫) หรือ ${PERSON_DIR_TH[row[2]]} (延年)<br>
            <span class="text-red-300">✘ เลี่ยง:</span> ${PERSON_DIR_TH[worst]} (絕命) ${PERSON_8M_INFO['絕命'].tip}
        </div>`;

    // 3) ปีชง: นักษัตรปีเกิดเทียบกับเวลาจร
    const by = pb.yz, nameBr = (i) => zhiData[i].th;
    const chip = (label, z) => {
        let txt = 'ปกติ', cls = 'bg-slate-900/70 border-slate-700 text-slate-300';
        if ((by + 6) % 12 === z) { txt = 'ชง ⚠'; cls = 'bg-red-900/50 border-red-600 text-red-200'; }
        else if (by === z && label === 'ปี') { txt = 'ปีเกิด 本命年'; cls = 'bg-amber-900/40 border-amber-600 text-amber-200'; }
        return `<div class="rounded-md border ${cls} px-1 py-1 text-center"><div class="text-[10px] opacity-80">${label}${nameBr(z)}</div><div class="text-[11px] font-semibold">${txt}</div></div>`;
    };
    const clashes = `
        <div class="text-[12px] font-semibold text-slate-200 mt-3 mb-1.5">⚡ ปีเกิด${nameBr(by)} กับเวลาจรตอนนี้</div>
        <div class="grid grid-cols-4 gap-1">${chip('ปี', tb.year)}${chip('เดือน', tb.month)}${chip('วัน', tb.day)}${chip('ยาม', tb.hour)}</div>
        <div class="mt-1 text-[10px] text-slate-400">ช่วงที่ "ชง" ไม่ควรเริ่มเรื่องสำคัญ เช่น ย้ายบ้าน ทำสัญญา</div>`;

    // 4) ความเข้ากันกับบ้านที่บันทึกไว้
    let houseHtml = '';
    if (typeof house !== 'undefined' && house) {
        const sitPal = HOUSE_PALACES[houseMountainOf(house.facing + 180).palace];
        const facePal = HOUSE_PALACES[houseMountainOf(house.facing).palace];
        const houseEast = ['N', 'S', 'E', 'SE'].includes(sitPal);
        const match = houseEast === isEast;
        const fs = personStarOf(facePal, kua);
        houseHtml = `
            <div class="text-[12px] font-semibold text-slate-200 mt-3 mb-1.5">🏠 คุณกับบ้านที่บันทึกไว้</div>
            <div class="rounded-md border ${match ? 'border-emerald-600 bg-emerald-950/40' : 'border-amber-600 bg-amber-950/30'} p-2 text-[11px] leading-relaxed">
                บ้านนั่ง${PERSON_DIR_TH[sitPal]} = บ้านกลุ่ม${houseEast ? 'ตะวันออก' : 'ตะวันตก'} ·
                <b class="${match ? 'text-emerald-300' : 'text-amber-300'}">${match ? 'เข้ากับคุณ' : 'ต่างกลุ่มกับคุณ'}</b><br>
                หน้าบ้าน (${PERSON_DIR_TH[facePal]}) ตรงกับ <span class="cn-char">${fs.c}</span> ของคุณ: ${fs.th}
                ${match ? '' : '<br><span class="text-slate-400">แก้ได้โดยเลือกห้องนอน/โต๊ะทำงานในทิศมงคลของคุณ</span>'}
            </div>`;
    }

    // 5) ธาตุทั้ง 5 ในดวง (นับก้านและกิ่งทั้ง 8 ตัว)
    const counts = { 'ไม้': 0, 'ไฟ': 0, 'ดิน': 0, 'ทอง': 0, 'น้ำ': 0 };
    [pb.yg, pb.mg, pb.dg, pb.hg].forEach(g => counts[ganData[g].el]++);
    [pb.yz, pb.mz, pb.dz, pb.hz].forEach(z => counts[zhiData[z].el]++);
    const bars = PERSON_EL_ORDER.map(e => `
        <div class="flex items-center gap-2 text-[11px]">
            <span class="w-8 ${PERSON_EL_TEXT[e]} ${e === dm.el ? 'font-bold' : ''}">${e}</span>
            <div class="flex-1 h-2.5 bg-slate-800 rounded"><div class="h-2.5 rounded ${PERSON_EL_COLOR[e]}" style="width:${counts[e] / 8 * 100}%"></div></div>
            <span class="w-4 text-right text-slate-300">${counts[e]}</span>
        </div>`).join('');
    const missing = PERSON_EL_ORDER.filter(e => counts[e] === 0);
    const elements = `
        <div class="text-[12px] font-semibold text-slate-200 mt-3 mb-1.5">☯ ธาตุในดวง (8 ตัวอักษร)</div>
        <div class="space-y-1">${bars}</div>
        <div class="mt-1 text-[10px] text-slate-400">ตัวหนา = ธาตุประจำตัว${missing.length ? ' · ขาดธาตุ' + missing.join(' ') : ''}</div>`;

    el.innerHTML = head + dirs + clashes + houseHtml + elements;
}
