// ของเสริม/แก้ต่อดาว และไอคอน (ใช้ร่วมกันระหว่างหน้าผังประจำปี annual.html และหน้าบ้านของฉัน home.html)
// ไม่มีโค้ดที่ผูกกับหน้าจอ

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
// ภาพวาดเองสำหรับของที่ไม่มีอีโมจิ (x, y = จุดกลาง, k = ขนาด)
const DRAW = {
  gourd: (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><circle cx="0" cy="6" r="9" fill="#d4a017" stroke="#92400e" stroke-width="1"/><circle cx="0" cy="-6" r="6" fill="#e3b341" stroke="#92400e" stroke-width="1"/><rect x="-1.5" y="-15" width="3" height="5" fill="#92400e"/><path d="M-6,6 a6,6 0 0 0 4,5" stroke="#fff6" fill="none"/></g>`,
  saltlamp: (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><path d="M-8,8 C-12,-2 -6,-14 0,-14 C7,-14 12,-3 8,8 Z" fill="#fb923c" stroke="#c2410c" stroke-width="1"/><path d="M-4,4 C-6,-3 -2,-9 1,-10" stroke="#fde68a" stroke-width="2" fill="none"/><rect x="-9" y="8" width="18" height="5" rx="1.5" fill="#78350f"/></g>`,
  metal: (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><polygon points="0,-13 11,0 0,13 -11,0" fill="#e5e7eb" stroke="#64748b" stroke-width="1.2"/><polygon points="0,-13 4,0 0,13 -4,0" fill="#fff"/><circle cx="7" cy="-9" r="1.6" fill="#fff"/></g>`
};
const iconSvg = (it, x, y, size) => DRAW[it.i] ? DRAW[it.i](x, y, size / 28) : `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${it.i}</text>`;
const iconHtml = (it, size) => DRAW[it.i] ? `<svg width="${size}" height="${size}" viewBox="-16 -16 32 32" class="inline-block align-middle">${DRAW[it.i](0, 0, 1)}</svg>` : `<span style="font-size:${size * 0.85}px" class="align-middle">${it.i}</span>`;
