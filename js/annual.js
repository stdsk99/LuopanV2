// หน้าผังพลังประจำปี (annual.html): ดาวจรปี 9 ทิศ + ทิศอสูร/ไท้ส่วย/ทิศแตก + ของเสริม/แก้ในแต่ละช่อง
// ตำแหน่งดาวใช้สูตรเดียวกับ APK หล่อแก (ดาวปี = (2000 − ปี) mod 9, ค่าชดเชยวัง N+5 NE+3 …) เปลี่ยนปีที่ 立春
// ความหมายและของเสริมเขียนสรุปเองจากหลักตำรา (ของเสริมทิศหลักตรงกับเอกสารของเจ้าของปี 2569)

const PAL = ['N','NE','E','SE','S','SW','W','NW'];
const PAL_TH = { N:'เหนือ', NE:'อีสาน (ต.อ.เฉียงเหนือ)', E:'ตะวันออก', SE:'อาคเนย์ (ต.อ.เฉียงใต้)', S:'ใต้', SW:'หรดี (ต.ต.เฉียงใต้)', W:'ตะวันตก', NW:'พายัพ (ต.ต.เฉียงเหนือ)' };
const PAL_SHORT = { N:'เหนือ', NE:'อีสาน', E:'ตะวันออก', SE:'อาคเนย์', S:'ใต้', SW:'หรดี', W:'ตะวันตก', NW:'พายัพ' };
const OFFSET = [5,3,7,8,4,6,2,1]; // ดาวในวัง = ดาวกลาง + ค่าชดเชย (ตาม APK)
const w9 = n => ((n-1)%9+9)%9+1;
const STAR = {
  1:{ k:'การงาน เงินเข้า', el:'น้ำ', name:'一白', good:true,  col:'#2563eb', t:'การงาน การเดินทาง เงินเข้า', a:'เสริมด้วยน้ำเคลื่อนไหว สีน้ำเงิน' },
  2:{ k:'โรคภัย', el:'ดิน', name:'二黑', good:false, col:'#a16207', t:'โรคภัย เจ็บป่วย ผู้สูงวัยหญิง', a:'น้ำเต้าทองเหลือง โลหะ ห้ามสีแดง ห้ามเคาะเจาะ' },
  3:{ k:'ทะเลาะ คดีความ', el:'ไม้', name:'三碧', good:false, col:'#15803d', t:'ทะเลาะวิวาท คดีความ ปากเสียง', a:'ใช้สีแดง โคมไฟ ลดความขัดแย้ง' },
  4:{ k:'การเรียน ความรัก', el:'ไม้', name:'四綠', good:true,  col:'#16a34a', t:'การศึกษา ความรัก ความคิดสร้างสรรค์', a:'ต้นไม้ในแจกันน้ำ ดินสอ 4 แท่ง' },
  5:{ k:'เคราะห์ร้ายแรง', el:'ดิน', name:'五黃', good:false, col:'#ca8a04', t:'เคราะห์ร้ายแรงที่สุด อุบัติภัย เจ็บป่วยหนัก', a:'โลหะหนัก ห้ามซ่อม ต่อเติม เจาะ ห้ามสีแดง' },
  6:{ k:'อำนาจ ผู้ใหญ่', el:'ทอง', name:'六白', good:true,  col:'#94a3b8', t:'อำนาจ ผู้ใหญ่อุปถัมภ์ เลื่อนตำแหน่ง', a:'วัตถุโลหะ สีขาว/ทอง' },
  7:{ k:'โจรภัย ปากเสียง', el:'ทอง', name:'七赤', good:false, col:'#64748b', t:'โจรภัย ปากเสียง ถูกหักหลัง', a:'น้ำนิ่ง สีน้ำเงิน/ดำ' },
  8:{ k:'ทรัพย์สิน', el:'ดิน', name:'八白', good:true,  col:'#d97706', t:'ทรัพย์สิน อสังหาฯ ความมั่นคง', a:'วัตถุดิน คริสตัล ไฟสีเหลือง' },
  9:{ k:'มงคล ชื่อเสียง', el:'ไฟ', name:'九紫', good:true,  col:'#dc2626', t:'มงคล ชื่อเสียง งานฉลอง', a:'แสงไฟ สีแดง ต้นไม้' }
};

// ของเสริม/แก้ต่อดาว (ใช้กับทุกปี) i = ไอคอน (อีโมจิ หรือชื่อภาพวาดเอง), l = ชื่อสั้น, p = จุดประสงค์
const REMEDY = {
  1: { p: 'เสริมการงาน', items: [{ i: '⛲', l: 'น้ำพุ' }, { i: '🐟', l: 'ตู้ปลา' }] },
  2: { p: 'ลดการป่วย', items: [{ i: 'gourd', l: 'น้ำเต้าทองเหลือง' }, { i: '🪙', l: 'เหรียญ 6 เหรียญ' }], note: 'ห้ามสีแดง' },
  3: { p: 'ลดทะเลาะ', items: [{ i: '🏮', l: 'โคมไฟแดง' }, { i: '🟥', l: 'ของสีแดง' }] },
  4: { p: 'เสริมการเรียน', items: [{ i: '🌳', l: 'ต้นไม้' }, { i: '✏️', l: 'ดินสอ 4 แท่ง' }] },
  5: { p: 'ลดพลังร้าย', items: [{ i: '🔔', l: 'กระดิ่งลมทองเหลือง' }, { i: 'metal', l: 'โลหะแวววาว' }], note: 'ห้ามเจาะ·สีแดง' },
  6: { p: 'เสริมผู้ใหญ่', items: [{ i: 'metal', l: 'โลหะแวววาว' }, { i: '🏆', l: 'ถ้วยรางวัล' }] },
  7: { p: 'กันขโมย', items: [{ i: '💧', l: 'น้ำนิ่ง' }, { i: '🔵', l: 'ของสีน้ำเงิน' }] },
  8: { p: 'เสริมโชคลาภ', items: [{ i: 'saltlamp', l: 'โคมไฟหินเกลือ' }, { i: '⛲', l: 'น้ำพุ' }] },
  9: { p: 'เสริมชื่อเสียง', items: [{ i: '🏮', l: 'โคมไฟแดง' }, { i: '🌿', l: 'ต้นไม้เขียว' }] }
};
// นักษัตรในแต่ละวัง (ไม่นับภูเขาที่เป็นกัว)
const PAL_ZHI = { N: [0], NE: [1, 2], E: [3], SE: [4, 5], S: [6], SW: [7, 8], W: [9], NW: [10, 11] };
// ภาพวาดเองสำหรับของที่ไม่มีอีโมจิ (x, y = จุดกลาง, k = ขนาด)
const DRAW = {
  gourd: (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><circle cx="0" cy="6" r="9" fill="#d4a017" stroke="#92400e" stroke-width="1"/><circle cx="0" cy="-6" r="6" fill="#e3b341" stroke="#92400e" stroke-width="1"/><rect x="-1.5" y="-15" width="3" height="5" fill="#92400e"/><path d="M-6,6 a6,6 0 0 0 4,5" stroke="#fff6" fill="none"/></g>`,
  saltlamp: (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><path d="M-8,8 C-12,-2 -6,-14 0,-14 C7,-14 12,-3 8,8 Z" fill="#fb923c" stroke="#c2410c" stroke-width="1"/><path d="M-4,4 C-6,-3 -2,-9 1,-10" stroke="#fde68a" stroke-width="2" fill="none"/><rect x="-9" y="8" width="18" height="5" rx="1.5" fill="#78350f"/></g>`,
  metal: (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><polygon points="0,-13 11,0 0,13 -11,0" fill="#e5e7eb" stroke="#64748b" stroke-width="1.2"/><polygon points="0,-13 4,0 0,13 -4,0" fill="#fff"/><circle cx="7" cy="-9" r="1.6" fill="#fff"/></g>`
};
const iconSvg = (it, x, y, size) => DRAW[it.i] ? DRAW[it.i](x, y, size / 28) : `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${it.i}</text>`;
const iconHtml = (it, size) => DRAW[it.i] ? `<svg width="${size}" height="${size}" viewBox="-16 -16 32 32" class="inline-block align-middle">${DRAW[it.i](0, 0, 1)}</svg>` : `<span style="font-size:${size * 0.85}px" class="align-middle">${it.i}</span>`;
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'], ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZHI_TH = ['ชวด','ฉลู','ขาล','เถาะ','มะโรง','มะเส็ง','มะเมีย','มะแม','วอก','ระกา','จอ','กุน'];
const M24 = ['壬','子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥'];

// ---------- สถานะ ----------
const NOW_YEAR = getExactPillars(new Date()).solarYear;  // ปีฮวงจุ้ยปัจจุบัน
let YEAR = NOW_YEAR, ROT = 0, heading = null;
let MODE = 'y';            // y = ดาวปี, m = ดาวเดือน, d = ดาววัน
let DATE = new Date();     // วันที่สำหรับโหมดเดือน/วัน
const TH_MONTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
let TOP = 'N';
try { TOP = localStorage.getItem('luopan_annual_top') || 'N'; } catch (e) {}

function render() {
    // ดาวกลางและกิ่ง (ใช้หาทิศอสูร/ทิศแตก) ตามโหมด ปี / เดือน / วัน
    const px = getExactPillars(MODE === 'y' ? new Date(YEAR, 6, 1) : DATE);
    let center, yg, yz, gzTitle, unit, extra = '';
    if (MODE === 'y') { center = w9((2000 - YEAR) % 9); const gz = (YEAR - 4) % 60; yg = gz % 10; yz = gz % 12; gzTitle = `ปี <b class="text-yellow-300 cn">${GAN[yg]}${ZHI[yz]}</b> ${ZHI_TH[yz]}`; unit = 'ปี'; }
    else if (MODE === 'm') { center = houseMonthStar(px.year, px.month); yg = px.bazi.mg; yz = px.month; gzTitle = `เดือน <b class="text-yellow-300 cn">${GAN[yg]}${ZHI[yz]}</b> (เดือน${ZHI_TH[yz]})`; unit = 'เดือน'; }
    else { const ds = houseDayStar(DATE); center = ds.star; yg = px.bazi.dg; yz = px.day; gzTitle = `วัน <b class="text-yellow-300 cn">${GAN[yg]}${ZHI[yz]}</b>`; unit = 'วัน'; extra = ds.yin ? 'ครึ่งปีหยิน (夏至→冬至) นับลด' : 'ครึ่งปีหยาง (冬至→夏至) นับเพิ่ม'; }
    const PERIOD = housePeriodOf(MODE === 'y' ? YEAR : px.solarYear);
    document.getElementById('legTai').hidden = MODE !== 'y';
    const stars = PAL.map((p,i) => w9(center + OFFSET[i]));
    // ทิศอสูร: ทิศหลัก 90° ตามกลุ่มนักษัตร (เหมือน calc.js / APK)
    const SS = [[8,0,4,135,'ใต้'],[5,9,1,45,'ตะวันออก'],[2,6,10,315,'เหนือ'],[11,3,7,225,'ตะวันตก']];
    const ssRow = SS.find(r => r.slice(0,3).includes(yz)), ssMid = { 135:180, 45:90, 315:0, 225:270 }[ssRow[3]];
    const taisui = yz * 30, clash = ((yz + 6) % 12) * 30; // องศากลางของกิ่ง
    // ---------- วาดจาน ----------
    const svg = document.getElementById('wheel'); let h = '';
    const P = (r, deg) => { const a = (deg + ROT - 90) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
    const arc = (r0, r1, d0, d1, fill, stroke = 'none', sw = 0, op = 1) => {
      const [x0,y0] = P(r1,d0), [x1,y1] = P(r1,d1), [x2,y2] = P(r0,d1), [x3,y3] = P(r0,d0), L = (d1-d0) > 180 ? 1 : 0;
      return `<path d="M${x0},${y0} A${r1},${r1} 0 ${L} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${L} 0 ${x3},${y3}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
    };
    const txt = (r, deg, s, size, fill, weight = 600, cls = '') => { const [x,y] = P(r,deg); return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="middle" dominant-baseline="central" class="${cls}">${s}</text>`; };
    const ringTxt = (r, deg, str, size, fill) => { const [x,y] = P(r,deg); const dd = ((deg + ROT) % 360 + 360) % 360, rot = (dd > 90 && dd < 270) ? dd + 180 : dd; return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="700" text-anchor="middle" dominant-baseline="central" transform="rotate(${rot} ${x} ${y})">${str}</text>`; };
    // วงนอก: ภูเขา 24 + ไฮไลต์
    h += `<circle r="292" fill="#0b1220" stroke="#334155" stroke-width="2"/>`;
    h += arc(262, 292, ssMid - 45, ssMid + 45, '#f97316', 'none', 0, 0.85);
    if (MODE === 'y') h += arc(262, 292, taisui - 15, taisui + 15, '#a855f7', 'none', 0, 0.95);
    h += arc(262, 292, clash - 15, clash + 15, '#dc2626', 'none', 0, 0.95);
    for (let m = 0; m < 24; m++) {
      const d = m * 15 - 15; // กลางภูเขา (壬 = 345°)
      h += `<line x1="${P(262,d-7.5)[0]}" y1="${P(262,d-7.5)[1]}" x2="${P(292,d-7.5)[0]}" y2="${P(292,d-7.5)[1]}" stroke="#1e293b" stroke-width="1.5"/>`;
      h += txt(277, d, M24[m], 15, '#f8fafc', 700, 'cn');
    }
    // ป้ายทิศร้ายบนวงนอก
    // วง 8 ทิศ
    for (let i = 0; i < 8; i++) {
      const n = stars[i], s = STAR[n], d = i * 45;
      h += arc(86, 258, d - 22.5, d + 22.5, s.col, '#0b1220', 3, 0.9);
      h += arc(236, 258, d - 22.5, d + 22.5, s.good ? '#22c55e' : '#ef4444', 'none', 0, 0.9);
      h += ringTxt(247, d, PAL_SHORT[PAL[i]], 13, '#fff');
      // เนื้อหาในวังวางเป็นกล่องตั้งตรงที่จุดเดียว (ไม่เรียงตามรัศมี) จึงไม่ทับกันในวังตะวันออก/ตะวันตก
      const [cx, cy] = P(166, d), rm = REMEDY[n];
      // ภาพของเสริม/แก้ 2 ชิ้นอยู่บนสุดของช่อง
      // ทับทิศอสูร: ของเสริมต้องไม่เคลื่อนไหว (เขียนกำกับใต้ภาพ)
      const still = Math.abs(((d - ssMid + 540) % 360) - 180) < 45;
      h += `<rect x="${cx - 34}" y="${cy - (still ? 74 : 66)}" width="68" height="${still ? 40 : 30}" rx="14" fill="#f8fafc" opacity="0.93" stroke="${still ? '#dc2626' : 'none'}" stroke-width="2"/>`;
      h += iconSvg(rm.items[0], cx - 13, cy - (still ? 59 : 51), 22) + iconSvg(rm.items[1], cx + 13, cy - (still ? 59 : 51), 19);
      if (still) h += `<text x="${cx}" y="${cy - 40}" font-size="8.5" font-weight="700" fill="#dc2626" text-anchor="middle">ห้ามเคลื่อนไหว</text>`;
      h += `<text x="${cx}" y="${cy - 14}" font-size="38" fill="#fff" font-weight="900" text-anchor="middle" dominant-baseline="central">${n}</text>`;
      h += `<text x="${cx}" y="${cy + 16}" font-size="12" fill="#fff" font-weight="600" text-anchor="middle" class="cn">${s.name} · ${s.el}</text>`;
      h += `<text x="${cx}" y="${cy + 32}" font-size="11.5" fill="#fff" font-weight="500" text-anchor="middle">${s.k}</text>`;
      // ป้ายเตือนในวัง (ทิศอสูรทับ: ของเสริมห้ามเคลื่อนไหว)
      const tags = [];
      const inSS = Math.abs(((d - ssMid + 540) % 360) - 180) < 45;
      if (inSS) tags.push('อสูร');
      if (MODE === 'y' && Math.abs(((d - taisui + 540) % 360) - 180) < 22.5) tags.push('ไท้ส่วย');
      if (Math.abs(((d - clash + 540) % 360) - 180) < 22.5) tags.push('ชง');
      const warn = tags.length ? '⚠ ' + tags.join(' · ') : (rm.note ? '⚠ ' + rm.note : '');
      if (warn) h += `<text x="${cx}" y="${cy + 49}" font-size="10.5" fill="#fde047" font-weight="700" text-anchor="middle">${warn}</text>`;
    }
    // กลาง
    const cs = STAR[center];
    h += `<circle r="84" fill="#0f172a" stroke="${cs.good ? '#22c55e' : '#ef4444'}" stroke-width="4"/>`;
    h += txt(0, 0, '', 1, '#fff');
    h += `<text x="0" y="-30" font-size="13" fill="#94a3b8" text-anchor="middle">กลางบ้าน</text>`;
    h += `<text x="0" y="8" font-size="48" fill="#fde047" font-weight="900" text-anchor="middle" dominant-baseline="central">${center}</text>`;
    h += `<text x="0" y="44" font-size="12" fill="#e2e8f0" text-anchor="middle" class="cn">${cs.name} · ${cs.el}</text>`;
    // ลูกศรทิศเหนือ
    { const [ax, ay] = P(300, 0), [bx, by] = P(286, -2.2), [cx2, cy2] = P(286, 2.2); h += `<polygon points="${ax},${ay} ${bx},${by} ${cx2},${cy2}" fill="#ef4444"/>`; }
    svg.innerHTML = h;
    // ---------- ข้อความ ----------
    document.getElementById('yLabel').textContent = MODE === 'y' ? `${YEAR} (พ.ศ. ${YEAR + 543})`
        : MODE === 'm' ? `${TH_MONTH[DATE.getMonth()]} ${DATE.getFullYear() + 543}` : `${DATE.getDate()} ${TH_MONTH[DATE.getMonth()]} ${DATE.getFullYear() + 543}`;
    document.getElementById('chips').innerHTML = [
      gzTitle,
      `ดาวกลาง <b class="text-yellow-300">${center}</b>`,
      `ยุค <b class="text-yellow-300">${PERIOD}</b> (${housePeriodRange(PERIOD).join('–')})`,
      MODE === 'y' ? `เปลี่ยนปีที่ 立春 4 ก.พ.` : MODE === 'm' ? `เดือนเปลี่ยนที่สารทต้นเดือน (節)` : extra
    ].map(t => `<span class="bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1">${t}</span>`).join('');
    const pi = (deg) => Math.round(((deg % 360) + 360) % 360 / 45) % 8;
    document.getElementById('summary').innerHTML = `
      <h2 class="text-[14px] font-semibold text-sky-300 mb-2">⚠️ สรุปทิศต้องระวัง${unit}นี้</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
        <div class="rounded-lg border border-orange-500/70 bg-orange-950/30 p-2"><b class="text-orange-300">ทิศอสูร (三煞)</b> · ${ssRow[4]} ${ssRow[3]}°–${(ssRow[3] + 90) % 360}°<br><span class="text-slate-300">ห้ามซ่อม ต่อเติม ขุด เจาะ ห้ามนั่งหันหลังให้ทิศนี้</span></div>
        ${MODE === 'y' ? `<div class="rounded-lg border border-purple-500/70 bg-purple-950/30 p-2"><b class="text-purple-300">ไท้ส่วย (太歲)</b> · ${PAL_SHORT[PAL[pi(taisui)]]} (<span class="cn">${ZHI[yz]}</span> ${(taisui + 352.5) % 360}°–${(taisui + 7.5) % 360}°)<br><span class="text-slate-300">ห้ามรบกวน ห้ามนั่งหันหน้าเข้าหา</span></div>` : ''}
        <div class="rounded-lg border border-red-500/70 bg-red-950/30 p-2"><b class="text-red-300">ทิศแตก/ชง (${MODE === 'y' ? '歲破' : MODE === 'm' ? '月破' : '日破'})</b> · ${PAL_SHORT[PAL[pi(clash)]]} (<span class="cn">${ZHI[(yz + 6) % 12]}</span>)<br><span class="text-slate-300">ไม่ควรเริ่มก่อสร้าง ซ่อมแซม</span></div>
        <div class="rounded-lg border border-yellow-500/70 bg-yellow-950/30 p-2"><b class="text-yellow-300">ดาว 5 (五黃)</b> · ${PAL_SHORT[PAL[stars.indexOf(5)]] || 'กลางบ้าน'} · <b class="text-yellow-300">ดาว 2 (二黑)</b> · ${PAL_SHORT[PAL[stars.indexOf(2)]] || 'กลางบ้าน'}<br><span class="text-slate-300">ใช้โลหะหนัก น้ำเต้าทองเหลือง ห้ามสีแดง</span></div>
      </div>`;
    const rows = PAL.map((p, i) => ({ p, i, n: stars[i], s: STAR[stars[i]] }));
    const rank = { 9:0, 8:1, 6:2, 1:3, 4:4, 3:5, 7:6, 2:7, 5:8 };
    rows.sort((a, b) => rank[a.n] - rank[b.n]);
    document.getElementById('list').innerHTML = rows.map(r => {
      const d = r.i * 45, tags = [];
      if (Math.abs(((d - ssMid + 540) % 360) - 180) < 45) tags.push('<span class="px-1.5 rounded bg-orange-600 text-white">ทิศอสูร</span>');
      if (MODE === 'y' && Math.abs(((d - taisui + 540) % 360) - 180) < 22.5) tags.push('<span class="px-1.5 rounded bg-purple-600 text-white">ไท้ส่วย</span>');
      if (Math.abs(((d - clash + 540) % 360) - 180) < 22.5) tags.push('<span class="px-1.5 rounded bg-red-600 text-white">ชง</span>');
      return `<div class="grid grid-cols-[56px_minmax(0,1fr)] gap-2 p-2 rounded-xl border ${r.s.good ? 'border-emerald-800' : 'border-red-900'} bg-slate-950/60">
        <div class="rounded-lg text-center py-1" style="background:${r.s.col}"><div class="text-[24px] font-black leading-none text-white">${r.n}</div><div class="text-[10px] text-white">${r.s.el}</div></div>
        <div class="min-w-0"><div class="flex flex-wrap items-center gap-1.5 text-[13px]"><b>${PAL_TH[r.p]}</b><span class="text-[11px] px-2 rounded-full ${r.s.good ? 'bg-emerald-800 text-emerald-100' : 'bg-red-800 text-red-100'}">${r.s.good ? 'ดี' : 'ระวัง'}</span>${tags.join('')}</div>
        <div class="text-[12px] text-slate-300">${r.s.t}${r.n === PERIOD ? ` (ดาวรุ่งยุค ${PERIOD})` : ''}</div>
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11.5px] text-sky-200"><span class="text-slate-400">ทิศ${PAL_ZHI[r.p].map(z => ZHI_TH[z]).join('-')}:</span>${REMEDY[r.n].items.map(it => `<span class="inline-flex items-center gap-1 bg-slate-800 rounded-full pl-1 pr-2 py-0.5">${iconHtml(it, 20)} ${it.l}</span>`).join('')}<span class="text-sky-300">${REMEDY[r.n].p}</span>${(Math.abs(((r.i * 45 - ssMid + 540) % 360) - 180) < 45) ? '<span class="text-red-300">· ไม่เคลื่อนไหว เพราะทับทิศอสูร</span>' : (REMEDY[r.n].note ? `<span class="text-red-300">· ${REMEDY[r.n].note}</span>` : '')}</div></div></div>`;
    }).join('');

}

// ---------- ปุ่ม ----------
const $id = (id) => document.getElementById(id);
function setTop(v) {
    TOP = v; try { localStorage.setItem('luopan_annual_top', v); } catch (e) {}
    document.querySelectorAll('#topSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    if (v === 'C') startHeading(); else stopHeading();
    applyRot();
}
function applyRot() {
    ROT = TOP === 'S' ? 180 : TOP === 'C' && heading !== null ? -heading : 0;
    $id('hint').hidden = !(TOP === 'C');
    render();
}
// ◀ ▶ เลื่อนทีละ ปี / เดือน / วัน ตามโหมด
function step(k) {
    if (MODE === 'y') YEAR += k;
    else if (MODE === 'm') { DATE = new Date(DATE.getFullYear(), DATE.getMonth() + k, 15); }
    else { DATE = new Date(DATE.getFullYear(), DATE.getMonth(), DATE.getDate() + k, 12); }
    render();
}
$id('prevY').addEventListener('click', () => step(-1));
$id('nextY').addEventListener('click', () => step(1));
$id('nowY').addEventListener('click', () => { YEAR = NOW_YEAR; DATE = new Date(); render(); });
$id('modeSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    MODE = b.dataset.v;
    document.querySelectorAll('#modeSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (MODE !== 'y' && YEAR !== NOW_YEAR && DATE.getFullYear() !== YEAR) DATE = new Date(YEAR, DATE.getMonth(), 15);
    render();
});
$id('topSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setTop(b.dataset.v); });

// ---------- หมุนตามเข็มทิศ ----------
// ขอสิทธิ์ก่อนเสมอถ้าเบราว์เซอร์มี requestPermission (iOS และ Chrome บางรุ่น) แล้วฟังค่าทิศเหนือจริง
let gotAbs = false, absTimer = null, lastDraw = 0;
function onOrient(e) {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if ((e.absolute || e.type === 'deviceorientationabsolute') && e.alpha !== null) h = 360 - e.alpha;
    if (h === null) return;
    gotAbs = true;
    const scr = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    heading = ((h + scr) % 360 + 360) % 360;
    const t = performance.now();
    if (t - lastDraw > 80) { lastDraw = t; $id('hint').textContent = `ทิศที่หัวเครื่องชี้: ${heading.toFixed(0)}° · ถือเครื่องแนวราบ`; applyRot(); }
}
async function startHeading() {
    try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') await DeviceOrientationEvent.requestPermission(); } catch (e) {}
    window.addEventListener('deviceorientationabsolute', onOrient, true);
    window.addEventListener('deviceorientation', onOrient, true);
    $id('hint').textContent = 'กำลังรอค่าเข็มทิศ… ถือเครื่องแนวราบ';
    clearTimeout(absTimer);
    absTimer = setTimeout(() => { if (!gotAbs) $id('hint').textContent = 'เครื่องนี้ไม่ส่งค่าทิศเหนือ ใช้ "เหนือ" หรือ "ใต้" แทน'; }, 3000);
}
function stopHeading() {
    window.removeEventListener('deviceorientationabsolute', onOrient, true);
    window.removeEventListener('deviceorientation', onOrient, true);
    clearTimeout(absTimer); heading = null;
}

setTop(TOP === 'C' ? 'N' : TOP);  // เปิดหน้าใหม่ไม่เปิดเข็มทิศเอง (ต้องกดเพื่อขอสิทธิ์)
