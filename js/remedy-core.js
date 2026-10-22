// คลังของเสริม/ของแก้ พร้อมภาพวาด (ใช้ร่วมกันระหว่างหน้าผังประจำปี annual.html, หน้าบ้านของฉัน home.html และคลังวิธีแก้ remedies.html)
// ไม่มีโค้ดที่ผูกกับหน้าจอ · คำอธิบายเขียนสรุปเองจากหลักฮวงจุ้ยทั่วไป · ภาพวาดเองทั้งหมด (SVG 64×64)

// สีพื้นวงกลมตามธาตุ
const REMEDY_EL = {
    'น้ำ': { bg: '#0b2447', ring: '#3b82f6', chip: 'background:#1e3a8a;color:#bfdbfe' },
    'ไม้': { bg: '#0b3b24', ring: '#22c55e', chip: 'background:#14532d;color:#bbf7d0' },
    'ไฟ': { bg: '#4a0d0d', ring: '#ef4444', chip: 'background:#7f1d1d;color:#fecaca' },
    'ดิน': { bg: '#3d2606', ring: '#f59e0b', chip: 'background:#78350f;color:#fde68a' },
    'ทอง': { bg: '#1f2937', ring: '#cbd5e1', chip: 'background:#334155;color:#e2e8f0' }
};

// k: boost = เสริมโชค, fix = ลดร้าย · art = ภาพในกรอบ 64×64 (ไม่รวมวงกลมพื้น)
const REMEDY_LIB = {
    fountain: {
        l: 'น้ำพุ', el: 'น้ำ', k: 'boost', for: 'เรียกเงิน การงาน โอกาสใหม่ ๆ',
        where: 'ทิศที่ดาวน้ำรุ่ง หรือทิศที่มีดาวจร 1 / 8 · ใกล้ประตูหรือห้องนั่งเล่น',
        how: 'ให้น้ำไหลเข้าหาตัวบ้าน เปิดน้ำทุกวัน เปลี่ยนน้ำสัปดาห์ละครั้ง',
        avoid: 'ห้ามวางในห้องนอน · ห้ามวางทิศที่มีดาว 2 หรือ 5 · ห้ามปล่อยให้น้ำขุ่นหรือแห้ง',
        art: `<ellipse cx="32" cy="48" rx="20" ry="5" fill="#1e40af"/><path d="M12,46 Q32,58 52,46 L50,44 Q32,52 14,44Z" fill="#94a3b8"/><ellipse cx="32" cy="44" rx="18" ry="4.5" fill="#60a5fa"/><rect x="29" y="26" width="6" height="18" rx="2" fill="#cbd5e1"/><ellipse cx="32" cy="27" rx="11" ry="3.5" fill="#94a3b8"/><ellipse cx="32" cy="26" rx="9" ry="2.6" fill="#93c5fd"/><path d="M32,24 C32,16 26,14 21,22 M32,24 C32,16 38,14 43,22" stroke="#bfdbfe" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M21,23 Q18,34 17,42 M43,23 Q46,34 47,42" stroke="#93c5fd" stroke-width="1.6" fill="none" stroke-dasharray="2 3" stroke-linecap="round"/><circle cx="32" cy="15" r="2.2" fill="#dbeafe"/>`
    },
    aquarium: {
        l: 'ตู้ปลา', el: 'น้ำ', k: 'boost', for: 'เงินหมุนเวียน การค้า',
        where: 'ทิศที่ดาวน้ำรุ่ง หรือทิศที่มีดาวจร 1 · ห้องนั่งเล่นหรือหน้าร้าน',
        how: 'นิยมเลี้ยง 6 หรือ 9 ตัว ปั๊มลมให้น้ำเคลื่อนไหว ปลาตายให้เปลี่ยนทันที',
        avoid: 'ห้ามวางในห้องนอนหรือตรงข้ามเตาไฟ · ห้ามวางทิศที่มีดาว 2 หรือ 5',
        art: `<rect x="11" y="18" width="42" height="30" rx="4" fill="#1d4ed8" stroke="#e2e8f0" stroke-width="2"/><rect x="13" y="24" width="38" height="22" rx="2" fill="#3b82f6"/><path d="M13,24 Q22,21 32,24 T51,24" fill="#60a5fa"/><path d="M18,46 C17,38 20,34 18,30 M22,46 C23,40 21,36 24,32" stroke="#22c55e" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M30,35 C34,30 40,30 43,35 C40,40 34,40 30,35Z" fill="#fb923c"/><path d="M30,35 L25,31 L25,39Z" fill="#f97316"/><circle cx="40" cy="34" r="1.2" fill="#0f172a"/><circle cx="46" cy="29" r="1.6" fill="none" stroke="#dbeafe" stroke-width="1"/><circle cx="48" cy="25" r="1.1" fill="none" stroke="#dbeafe" stroke-width="1"/><rect x="9" y="47" width="46" height="5" rx="2" fill="#475569"/>`
    },
    gourd: {
        l: 'น้ำเต้าทองเหลือง', el: 'ทอง', k: 'fix', for: 'ลดโรคภัย เจ็บป่วย',
        where: 'ทิศที่มีดาว 2 หรือ 5 · ข้างหัวเตียงหรือห้องของผู้ป่วยและผู้สูงอายุ',
        how: 'วางตั้งบนโต๊ะหรือแขวนก็ได้ ขัดให้เงาอยู่เสมอ ใช้ทองเหลืองแท้',
        avoid: 'ห้ามวางคู่ของสีแดงหรือโคมไฟ (ไฟเสริมพลังดินของดาว 2/5)',
        art: `<circle cx="32" cy="41" r="13" fill="#d4a017" stroke="#92400e" stroke-width="1.5"/><path d="M27,31 C24,27 26,20 32,20 C38,20 40,27 37,31Z" fill="#e3b341" stroke="#92400e" stroke-width="1.5"/><circle cx="32" cy="24" r="7.5" fill="#e3b341" stroke="#92400e" stroke-width="1.5"/><rect x="29.5" y="11" width="5" height="7" rx="1.5" fill="#92400e"/><ellipse cx="32" cy="31" rx="6" ry="1.6" fill="#b45309"/><path d="M24,38 Q24,46 30,50" stroke="#fef3c7" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/><path d="M28,21 Q28,25 30,27" stroke="#fef3c7" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/>`
    },
    coins6: {
        l: 'เหรียญ 6 เหรียญ', el: 'ทอง', k: 'fix', for: 'ลดพลังดินของดาว 2 และ 5 กันเงินรั่ว',
        where: 'ทิศที่มีดาว 2 หรือ 5 · ใต้พรมหน้าประตู หรือแขวนข้างประตู',
        how: 'เหรียญจีนรูสี่เหลี่ยม 6 เหรียญ ร้อยด้วยเชือกเป็นพวง',
        avoid: 'ไม่วางในห้องน้ำหรือที่สกปรก',
        art: `<path d="M32,8 L32,14" stroke="#a16207" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map(i => { const x = 20 + (i % 3) * 12, y = 24 + Math.floor(i / 3) * 14; return `<circle cx="${x}" cy="${y}" r="6.5" fill="#eab308" stroke="#854d0e" stroke-width="1.2"/><rect x="${x - 2}" y="${y - 2}" width="4" height="4" fill="${'#1f2937'}"/><circle cx="${x}" cy="${y}" r="4.6" fill="none" stroke="#fde68a" stroke-width=".8" opacity=".7"/>`; }).join('')}<path d="M20,14 L44,14 M20,14 L20,17.5 M32,14 L32,17.5 M44,14 L44,17.5" stroke="#a16207" stroke-width="1.6"/><path d="M28,45 L32,54 L36,45" stroke="#a16207" stroke-width="1.6" fill="none"/>`
    },
    lantern: {
        l: 'โคมไฟแดง', el: 'ไฟ', k: 'fix', for: 'ลดทะเลาะ (ดาว 3) และเสริมชื่อเสียง งานมงคล (ดาว 9)',
        where: 'ทิศที่มีดาว 3 หรือดาว 9',
        how: 'เปิดไฟอย่างน้อยวันละ 3 ชั่วโมง ใช้ไฟโทนอุ่น',
        avoid: 'ห้ามวางทิศที่มีดาว 2 หรือ 5 (ไฟเสริมพลังร้ายของดิน)',
        art: `<circle cx="32" cy="34" r="22" fill="#f97316" opacity=".18"/><rect x="30.5" y="6" width="3" height="7" fill="#a16207"/><rect x="24" y="12" width="16" height="4" rx="1.5" fill="#eab308"/><ellipse cx="32" cy="32" rx="16" ry="15" fill="#dc2626"/><path d="M32,17 C26,22 26,42 32,47 M32,17 C38,22 38,42 32,47 M18,32 L46,32" stroke="#991b1b" stroke-width="1.4" fill="none"/><ellipse cx="26" cy="27" rx="3" ry="5" fill="#fca5a5" opacity=".5"/><rect x="24" y="46" width="16" height="4" rx="1.5" fill="#eab308"/><path d="M29,50 L28,59 M32,50 L32,60 M35,50 L36,59" stroke="#eab308" stroke-width="1.6" stroke-linecap="round"/>`
    },
    redthing: {
        l: 'ของสีแดง', el: 'ไฟ', k: 'fix', for: 'ลดทะเลาะ ปากเสียง คดีความ (ดาว 3)',
        where: 'ทิศที่มีดาว 3 · เช่น พรม หมอนอิง ผ้าม่าน หรือเชือกมงคลสีแดง',
        how: 'เลือกของแดงสด ไม่ซีด วางให้เห็นชัด',
        avoid: 'ห้ามใช้ในทิศที่มีดาว 2 หรือ 5',
        art: `<path d="M32,10 L44,22 L32,34 L20,22Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.5"/><path d="M26,16 L38,28 M38,16 L26,28 M32,10 L32,34 M20,22 L44,22" stroke="#fca5a5" stroke-width="1.2" opacity=".75"/><circle cx="32" cy="22" r="3" fill="#fbbf24"/><path d="M32,34 L32,38" stroke="#b91c1c" stroke-width="2"/><rect x="29" y="38" width="6" height="4" rx="1" fill="#fbbf24"/><path d="M29,42 Q27,52 26,56 M31,42 L30.5,57 M33,42 L33.5,57 M35,42 Q37,52 38,56" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><path d="M32,4 L32,10" stroke="#b91c1c" stroke-width="2"/>`
    },
    plant: {
        l: 'ต้นไม้ใบเขียว', el: 'ไม้', k: 'boost', for: 'การเรียน ความรัก ชื่อเสียง (ดาว 4, 9) และลดดาว 1 ที่อ่อน',
        where: 'ทิศที่มีดาว 4 หรือ 9 · มุมห้องนั่งเล่นหรือห้องทำงาน',
        how: 'เลือกใบกลมสีเขียวสด เช่น กวักมรกต เงินไหลมา รดน้ำ ตัดใบเหลืองออกเสมอ',
        avoid: 'ห้ามต้นไม้มีหนามหรือใบแห้ง · ไม่ใช้แก้ดาว 2/5 (ใช้โลหะแทน)',
        art: `<path d="M32,40 C31,30 30,24 26,18 M32,40 C33,30 36,22 41,17 M32,40 L32,22" stroke="#15803d" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="20" rx="8" ry="5" transform="rotate(-30 22 20)" fill="#22c55e"/><ellipse cx="42" cy="17" rx="8" ry="5" transform="rotate(25 42 17)" fill="#16a34a"/><ellipse cx="32" cy="16" rx="5" ry="8" fill="#4ade80"/><ellipse cx="22" cy="31" rx="8" ry="4.6" transform="rotate(-15 22 31)" fill="#16a34a"/><ellipse cx="42" cy="29" rx="8" ry="4.6" transform="rotate(15 42 29)" fill="#22c55e"/><path d="M20,40 L44,40 L41,55 L23,55Z" fill="#b45309"/><rect x="18" y="38" width="28" height="5" rx="2" fill="#d97706"/><path d="M24,46 L40,46" stroke="#fbbf24" stroke-width="1.2" opacity=".6"/>`
    },
    pencils4: {
        l: 'ดินสอ 4 แท่ง', el: 'ไม้', k: 'boost', for: 'การเรียน สอบ งานเขียน (ดาว 4 文昌)',
        where: 'ทิศที่มีดาว 4 · บนโต๊ะเรียนหรือโต๊ะทำงาน',
        how: 'ดินสอไม้ 4 แท่งปักในแก้วหรือแจกันเล็ก หัวขึ้น เหลาให้แหลม',
        avoid: 'ห้ามใช้ดินสอหักหรือทู่',
        art: `${[[22, -12, '#facc15'], [28, -4, '#fb923c'], [36, 4, '#38bdf8'], [42, 12, '#a3e635']].map(([x, r, c]) => `<g transform="rotate(${r} ${x} 40)"><rect x="${x - 3}" y="12" width="6" height="28" fill="${c}"/><path d="M${x - 3},12 L${x},5 L${x + 3},12Z" fill="#fcd9b6"/><path d="M${x - 1},7.5 L${x},5 L${x + 1},7.5Z" fill="#334155"/><rect x="${x - 3}" y="12" width="6" height="2" fill="#ffffff66"/></g>`).join('')}<path d="M18,34 L46,34 L43,55 L21,55Z" fill="#475569"/><rect x="16" y="32" width="32" height="4" rx="2" fill="#64748b"/><path d="M24,40 L24,51" stroke="#94a3b8" stroke-width="1.4" opacity=".6"/>`
    },
    windchime: {
        l: 'กระดิ่งลมทองเหลือง', el: 'ทอง', k: 'fix', for: 'สลายพลังร้ายของดาว 5 และดาว 2',
        where: 'ทิศที่มีดาว 5 (สำคัญที่สุด) หรือดาว 2 · ริมหน้าต่างหรือจุดที่มีลมโกรก',
        how: 'ทองเหลืองแบบหลอดกลวง 6 แท่ง แขวนให้มีเสียงเป็นระยะ',
        avoid: 'ห้ามแขวนเหนือหัวเตียงหรือโต๊ะทำงาน · ห้ามแบบไม้หรือมีสีแดง',
        art: `<path d="M32,4 L32,10" stroke="#a16207" stroke-width="2"/><ellipse cx="32" cy="12" rx="15" ry="3.5" fill="#d4a017" stroke="#92400e" stroke-width="1.2"/>${[[19, 32], [24, 38], [29, 44], [35, 44], [40, 38], [45, 32]].map(([x, b]) => `<path d="M${x},14 L${x},${b - 20}" stroke="#94a3b8" stroke-width=".8"/><rect x="${x - 1.7}" y="${b - 20}" width="3.4" height="20" rx="1.5" fill="#eab308" stroke="#92400e" stroke-width=".8"/><rect x="${x - 1}" y="${b - 19}" width="1" height="18" fill="#fef3c7" opacity=".7"/>`).join('')}<path d="M32,14 L32,48" stroke="#94a3b8" stroke-width=".8"/><circle cx="32" cy="50" r="4" fill="#d4a017" stroke="#92400e" stroke-width="1"/><path d="M32,54 L32,58 L29,61 M32,58 L35,61" stroke="#94a3b8" stroke-width="1"/>`
    },
    metal: {
        l: 'โลหะแวววาว', el: 'ทอง', k: 'fix', for: 'ลดดาว 2 และ 5 · เสริมอำนาจ ผู้ใหญ่ (ดาว 6)',
        where: 'ทิศที่มีดาว 2, 5 หรือ 6 · เช่น ลูกบอลโลหะ ชามทองเหลือง รูปปั้นโลหะ',
        how: 'ยิ่งหนักยิ่งดี ขัดให้เงาเสมอ',
        avoid: 'ไม่วางในทิศที่ใช้ไฟแก้ดาว 3',
        art: `<ellipse cx="32" cy="52" rx="16" ry="3.5" fill="#0f172a" opacity=".5"/><circle cx="32" cy="32" r="18" fill="#cbd5e1"/><circle cx="32" cy="32" r="18" fill="none" stroke="#64748b" stroke-width="1.5"/><path d="M14,32 Q32,40 50,32 M32,14 Q24,32 32,50 M32,14 Q40,32 32,50" stroke="#94a3b8" stroke-width="1.2" fill="none"/><ellipse cx="25" cy="24" rx="6" ry="4" transform="rotate(-35 25 24)" fill="#ffffff" opacity=".85"/><circle cx="40" cy="41" r="2.2" fill="#ffffff" opacity=".6"/>`
    },
    trophy: {
        l: 'ถ้วยรางวัล', el: 'ทอง', k: 'boost', for: 'อำนาจ ตำแหน่ง ผู้ใหญ่อุปถัมภ์ (ดาว 6)',
        where: 'ทิศที่มีดาว 6 · ห้องทำงานหรือโต๊ะผู้บริหาร',
        how: 'โลหะสีทองหรือเงิน ตั้งให้เด่น',
        avoid: 'ห้ามใช้ถ้วยที่บุบหรือหมอง',
        art: `<path d="M21,12 L43,12 L42,26 C41,34 36,38 32,38 C28,38 23,34 22,26Z" fill="#eab308" stroke="#92400e" stroke-width="1.4"/><path d="M21,15 C12,15 12,27 23,28 M43,15 C52,15 52,27 41,28" stroke="#eab308" stroke-width="3" fill="none"/><path d="M26,15 C26,24 28,30 31,33" stroke="#fef3c7" stroke-width="2.2" fill="none" opacity=".75" stroke-linecap="round"/><rect x="29.5" y="38" width="5" height="7" fill="#ca8a04"/><path d="M24,45 L40,45 L42,52 L22,52Z" fill="#a16207"/><rect x="26" y="47" width="12" height="2.5" rx="1" fill="#fde68a" opacity=".8"/><path d="M32,18 L33.5,21.5 L37,22 L34.5,24.5 L35,28 L32,26.3 L29,28 L29.5,24.5 L27,22 L30.5,21.5Z" fill="#fef9c3"/>`
    },
    stillwater: {
        l: 'น้ำนิ่ง', el: 'น้ำ', k: 'fix', for: 'ลดขโมย ปากเสียง ถูกหักหลัง (ดาว 7)',
        where: 'ทิศที่มีดาว 7',
        how: 'แก้วหรือโถใสใส่น้ำสะอาด เปลี่ยนน้ำทุก 3 วัน',
        avoid: 'ห้ามปล่อยให้น้ำค้างจนเน่า',
        art: `<path d="M16,22 C16,46 22,52 32,52 C42,52 48,46 48,22Z" fill="#bfdbfe" opacity=".35" stroke="#e2e8f0" stroke-width="2"/><path d="M17.5,32 C18,46 23,50.5 32,50.5 C41,50.5 46,46 46.5,32Z" fill="#2563eb" opacity=".85"/><ellipse cx="32" cy="32" rx="14.5" ry="3" fill="#60a5fa"/><ellipse cx="32" cy="22" rx="16" ry="3.5" fill="none" stroke="#e2e8f0" stroke-width="2"/><path d="M21,36 C21,43 24,47 28,48" stroke="#dbeafe" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/><ellipse cx="36" cy="31.5" rx="5" ry="1.4" fill="#22c55e"/>`
    },
    bluething: {
        l: 'ของสีน้ำเงิน/ดำ', el: 'น้ำ', k: 'fix', for: 'ลดขโมย ปากเสียง (ดาว 7)',
        where: 'ทิศที่มีดาว 7 · เช่น แจกันเซรามิก พรม ผ้าม่านสีน้ำเงินหรือดำ',
        how: 'เลือกโทนน้ำเงินเข้มหรือดำ วางให้เห็นชัด',
        avoid: 'ห้ามใช้ในทิศที่ดาวไฟ 9 รุ่ง',
        art: `<path d="M26,10 L38,10 L37,16 C46,22 48,32 44,44 C42,50 38,54 32,54 C26,54 22,50 20,44 C16,32 18,22 27,16Z" fill="#1e3a8a" stroke="#93c5fd" stroke-width="1.5"/><rect x="25" y="8" width="14" height="4" rx="1.5" fill="#1e40af" stroke="#93c5fd" stroke-width="1.2"/><path d="M21,34 Q32,28 43,34 M20,40 Q32,34 44,40" stroke="#60a5fa" stroke-width="1.4" fill="none"/><path d="M27,24 Q32,30 37,24" stroke="#93c5fd" stroke-width="1.2" fill="none"/><path d="M24,22 C21,30 22,40 25,46" stroke="#dbeafe" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/>`
    },
    saltlamp: {
        l: 'โคมไฟหินเกลือ', el: 'ดิน', k: 'boost', for: 'ทรัพย์สิน อสังหาฯ ความมั่นคง (ดาว 8)',
        where: 'ทิศที่มีดาว 8 · ห้องนั่งเล่นหรือห้องทำงาน',
        how: 'เปิดไฟวันละหลายชั่วโมง (ไฟเสริมดิน) เช็ดฝุ่นด้วยผ้าแห้ง',
        avoid: 'ห้ามวางที่ชื้นหรือใกล้น้ำ',
        art: `<circle cx="32" cy="30" r="22" fill="#fb923c" opacity=".2"/><path d="M19,44 C14,30 20,12 32,11 C45,11 50,30 45,44Z" fill="#fb923c" stroke="#c2410c" stroke-width="1.5"/><path d="M25,40 C22,30 25,20 31,17" stroke="#fde68a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/><path d="M36,18 L40,26 L34,30 M40,26 L44,34" stroke="#c2410c" stroke-width="1.2" fill="none" opacity=".6"/><rect x="17" y="43" width="30" height="8" rx="2.5" fill="#78350f"/><rect x="17" y="43" width="30" height="2.5" rx="1" fill="#a16207"/>`
    },
    crystal: {
        l: 'หินหรือคริสตัล', el: 'ดิน', k: 'boost', for: 'สุขภาพ คนในบ้าน ความมั่นคง (เสริมดาวภูเขา)',
        where: 'ทิศที่ดาวภูเขาดี · หลังบ้าน ห้องนอน หรือหลังโต๊ะทำงาน',
        how: 'หินก้อนใหญ่ คริสตัลกลุ่ม หรืออเมทิสต์ วางนิ่ง ๆ',
        avoid: 'ห้ามวางคู่กับน้ำ (ดาวภูเขาไม่ชอบน้ำ)',
        art: `<path d="M14,50 L50,50 L46,44 L18,44Z" fill="#57534e"/><path d="M20,44 L23,24 L28,18 L31,44Z" fill="#a78bfa"/><path d="M28,44 L31,14 L35,8 L39,14 L40,44Z" fill="#8b5cf6"/><path d="M38,44 L42,26 L46,22 L47,44Z" fill="#c4b5fd"/><path d="M31,14 L35,8 L35,44 L31,44Z" fill="#ddd6fe" opacity=".55"/><path d="M23,24 L28,18 L27,44 L23,44Z" fill="#ede9fe" opacity=".4"/><path d="M13,44 L17,36 L22,44Z" fill="#7c3aed"/><circle cx="34" cy="16" r="1.4" fill="#fff"/>`
    },
    cabinet: {
        l: 'ตู้หรือของหนัก', el: 'ดิน', k: 'boost', for: 'หนุนดาวภูเขา สุขภาพ ความมั่นคง',
        where: 'ทิศที่ดาวภูเขาดี · ชิดผนังหลังบ้าน หรือหลังหัวเตียง',
        how: 'ตู้ไม้ ชั้นหนังสือ หรือเฟอร์นิเจอร์ทึบหนัก ตั้งให้มั่นคง',
        avoid: 'ไม่วางขวางประตูหรือทางเดิน',
        art: `<rect x="16" y="10" width="32" height="42" rx="2.5" fill="#92400e" stroke="#451a03" stroke-width="1.5"/><rect x="19" y="13" width="26" height="11" rx="1.5" fill="#b45309"/><rect x="19" y="26" width="26" height="11" rx="1.5" fill="#b45309"/><rect x="19" y="39" width="26" height="10" rx="1.5" fill="#b45309"/><rect x="28" y="17.5" width="8" height="2.2" rx="1" fill="#fde68a"/><rect x="28" y="30.5" width="8" height="2.2" rx="1" fill="#fde68a"/><rect x="28" y="43" width="8" height="2.2" rx="1" fill="#fde68a"/><rect x="18" y="52" width="4" height="4" fill="#451a03"/><rect x="42" y="52" width="4" height="4" fill="#451a03"/><path d="M20,14 L20,22" stroke="#fbbf24" stroke-width="1" opacity=".5"/>`
    }
};

// ของเสริม/แก้ต่อดาว (ใช้กับทุกปี) i = รหัสใน REMEDY_LIB, l = ชื่อสั้น, p = จุดประสงค์
const REMEDY = {
  1: { p: 'เสริมการงาน', items: [{ i: 'fountain', l: 'น้ำพุ' }, { i: 'aquarium', l: 'ตู้ปลา' }] },
  2: { p: 'ลดการป่วย', items: [{ i: 'gourd', l: 'น้ำเต้าทองเหลือง' }, { i: 'coins6', l: 'เหรียญ 6 เหรียญ' }], note: 'ห้ามสีแดง' },
  3: { p: 'ลดทะเลาะ', items: [{ i: 'lantern', l: 'โคมไฟแดง' }, { i: 'redthing', l: 'ของสีแดง' }] },
  4: { p: 'เสริมการเรียน', items: [{ i: 'plant', l: 'ต้นไม้' }, { i: 'pencils4', l: 'ดินสอ 4 แท่ง' }] },
  5: { p: 'ลดพลังร้าย', items: [{ i: 'windchime', l: 'กระดิ่งลมทองเหลือง' }, { i: 'metal', l: 'โลหะแวววาว' }], note: 'ห้ามเจาะ·สีแดง' },
  6: { p: 'เสริมผู้ใหญ่', items: [{ i: 'metal', l: 'โลหะแวววาว' }, { i: 'trophy', l: 'ถ้วยรางวัล' }] },
  7: { p: 'กันขโมย', items: [{ i: 'stillwater', l: 'น้ำนิ่ง' }, { i: 'bluething', l: 'ของสีน้ำเงิน' }] },
  8: { p: 'เสริมโชคลาภ', items: [{ i: 'saltlamp', l: 'โคมไฟหินเกลือ' }, { i: 'fountain', l: 'น้ำพุ' }] },
  9: { p: 'เสริมชื่อเสียง', items: [{ i: 'lantern', l: 'โคมไฟแดง' }, { i: 'plant', l: 'ต้นไม้เขียว' }] }
};
// ดาวที่ใช้ของชิ้นนี้ (สำหรับแสดงในการ์ด)
function remedyStarsOf(id) { return Object.keys(REMEDY).filter(n => REMEDY[n].items.some(it => it.i === id)).map(Number); }

// ภาพวงกลมพื้นตามธาตุ + ภาพของ
function remedyArt(id) {
    const r = REMEDY_LIB[id]; if (!r) return '';
    const c = REMEDY_EL[r.el];
    return `<circle cx="32" cy="32" r="31" fill="${c.bg}"/><circle cx="32" cy="32" r="30" fill="none" stroke="${c.ring}" stroke-width="2" opacity=".85"/>${r.art}`;
}
// ไอคอนในข้อความ (HTML) และในจาน SVG (x, y = จุดกลาง)
const iconHtml = (it, size) => REMEDY_LIB[it.i] ? `<svg width="${size}" height="${size}" viewBox="0 0 64 64" class="inline-block align-middle shrink-0" aria-hidden="true">${remedyArt(it.i)}</svg>` : `<span style="font-size:${size * 0.85}px" class="align-middle">${it.i}</span>`;
const iconSvg = (it, x, y, size) => REMEDY_LIB[it.i] ? `<svg x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" viewBox="0 0 64 64" data-remedy="${it.i}" style="cursor:pointer"><title>${it.l}</title>${remedyArt(it.i)}</svg>` : `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${it.i}</text>`;
