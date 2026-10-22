// ทิศมงคลรายวัน (today.html): ทิศเงิน/โชค/ผู้อุปถัมภ์/วาสนาของวัน ยามดี-ร้าย และสิ่งที่ควรทำ/ควรเลี่ยง
// ข้อมูลทิศเทพประจำวัน (喜神 財神 福神 貴人) ยามมงคล (黃道/黑道) และ 宜/忌 มาจากไลบรารี Lunar.js (ปฏิทินจีนมาตรฐาน)

const $ = (id) => document.getElementById(id);
const cn = (s) => s ? ` <span class="cn text-slate-400" style="font-size:.85em">${s}</span>` : '';
const norm = (d) => ((d % 360) + 360) % 360;
// รหัสตรีโกณของ Lunar (ตัวย่อ) → วัง 0–7 (N NE E SE S SW W NW)
const TRI_PAL = { '坎': 0, '艮': 1, '震': 2, '巽': 3, '离': 4, '離': 4, '坤': 5, '兑': 6, '兌': 6, '乾': 7 };
const PAL_TH = ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'];
const PAL_TRI = ['坎', '艮', '震', '巽', '離', '坤', '兌', '乾'];
const SHA_PAL = { '东': 2, '南': 4, '西': 6, '北': 0 };
const ZHI = '子丑寅卯辰巳午未申酉戌亥', ZHI_TH = ['ชวด', 'ฉลู', 'ขาล', 'เถาะ', 'มะโรง', 'มะเส็ง', 'มะเมีย', 'มะแม', 'วอก', 'ระกา', 'จอ', 'กุน'];
const TH_MONTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
// คำในปฏิทิน 宜/忌 ที่พบบ่อย (แปลสรุปเอง) คำที่ไม่มีในรายการแสดงเป็นภาษาจีน
const YIJI_TH = {
    '入宅': 'ย้ายเข้าบ้าน', '移徙': 'ย้ายที่อยู่', '出行': 'เดินทาง', '进人口': 'รับคนเข้าบ้าน', '修造': 'ซ่อมสร้าง', '动土': 'ขุดดิน/ลงเสาเข็ม', '起基': 'วางฐานราก',
    '上梁': 'ยกคาน', '安门': 'ติดตั้งประตู', '订盟': 'ทำสัญญา/หมั้น', '纳采': 'สู่ขอ', '祭祀': 'ไหว้บรรพบุรุษ', '祈福': 'ขอพร', '安香': 'ตั้งหิ้งพระ', '开市': 'เปิดร้าน/เปิดกิจการ',
    '交易': 'ซื้อขาย', '立券': 'ทำสัญญา', '会亲友': 'พบญาติมิตร', '安机械': 'ติดตั้งเครื่องจักร', '栽种': 'ปลูกต้นไม้', '纳畜': 'เลี้ยงสัตว์', '盖屋': 'มุงหลังคา', '安床': 'ตั้งเตียง',
    '开光': 'ปลุกเสก/เบิกเนตร', '竖柱': 'ตั้งเสา', '安葬': 'ฝังศพ', '嫁娶': 'แต่งงาน', '求嗣': 'ขอบุตร', '破屋': 'รื้อบ้าน', '拆卸': 'รื้อถอน', '破土': 'ขุดดิน (งานศพ)', '纳财': 'รับเงิน/เก็บเงิน',
    '裁衣': 'ตัดเสื้อ', '沐浴': 'อาบน้ำชำระ', '理发': 'ตัดผม', '掘井': 'ขุดบ่อ', '入学': 'เข้าเรียน', '治病': 'รักษาโรค', '求医': 'หาหมอ', '挂匾': 'แขวนป้าย', '置产': 'ซื้ออสังหาฯ',
    '开仓': 'เปิดคลัง', '出货财': 'ส่งสินค้า/จ่ายเงิน', '赴任': 'รับตำแหน่ง', '作灶': 'ตั้งเตา', '修门': 'ซ่อมประตู', '分居': 'แยกบ้าน', '词讼': 'ฟ้องร้อง', '探病': 'เยี่ยมคนป่วย',
    '解除': 'ปัดรังควาน/ทำความสะอาด', '扫舍': 'ทำความสะอาดบ้าน', '修饰垣墙': 'ซ่อมรั้ว/ผนัง', '诸事不宜': 'ไม่ควรทำการใหญ่', '馀事勿取': 'นอกจากนี้ไม่ควรทำ', '斋醮': 'ทำบุญถือศีล', '冠笄': 'พิธีบรรลุนิติภาวะ',
    '开池': 'ขุดสระ', '放水': 'ปล่อยน้ำ', '伐木': 'ตัดต้นไม้', '安碓磑': 'ตั้งครกโม่', '造仓': 'สร้างโกดัง', '补垣': 'ซ่อมกำแพง', '塞穴': 'อุดรู', '出火': 'ย้ายเตาไฟ', '坏垣': 'รื้อกำแพง',
    '入殓': 'บรรจุศพ', '移柩': 'เคลื่อนศพ', '修坟': 'ซ่อมสุสาน', '立碑': 'ตั้งป้ายสุสาน', '成服': 'สวมชุดไว้ทุกข์', '除服': 'ถอดชุดไว้ทุกข์', '开厕': 'สร้างห้องน้ำ', '针灸': 'ฝังเข็ม',
    '牧养': 'เลี้ยงสัตว์', '经络': 'ทอผ้า', '造车器': 'สร้างยานพาหนะ', '捕捉': 'กำจัดศัตรูพืช', '畋猎': 'ล่าสัตว์', '取渔': 'จับปลา', '结网': 'ถักแห', '雇庸': 'จ้างคน', '纳婿': 'รับเขย', '问名': 'ดูดวงคู่', '无': '—'
};
const SPIRITS = [
    { k: 'Cai', icon: '💰', th: 'ทิศเงิน', cn: '財神', col: '#ca8a04', tip: 'หันหน้าทางนี้ตอนเจรจาค้าขาย เซ็นสัญญา หรือนับเงิน · ออกจากบ้านเดินไปทางนี้ก่อน' },
    { k: 'Xi', icon: '😊', th: 'ทิศโชคมงคล', cn: '喜神', col: '#dc2626', tip: 'หันหน้าทางนี้ตอนเริ่มงานสำคัญ สัมภาษณ์งาน ขอแต่งงาน งานมงคล' },
    { k: 'YangGui', icon: '🙏', th: 'ทิศผู้อุปถัมภ์ (กลางวัน)', cn: '陽貴', col: '#7c3aed', tip: 'นั่งหันทางนี้ตอนพบผู้ใหญ่ ขอความช่วยเหลือ หรือยื่นเรื่องสำคัญช่วงกลางวัน' },
    { k: 'YinGui', icon: '🌙', th: 'ทิศผู้อุปถัมภ์ (กลางคืน)', cn: '陰貴', col: '#4f46e5', tip: 'ใช้แทนทิศผู้อุปถัมภ์เมื่อพบผู้ใหญ่หรือทำเรื่องสำคัญหลังพระอาทิตย์ตก' },
    { k: 'Fu', icon: '🍀', th: 'ทิศวาสนา', cn: '福神', col: '#16a34a', tip: 'หันหน้าทางนี้ตอนสวดมนต์ ทำบุญ ขอพร หรือทำสมาธิ' }
];

let DAY = new Date(), HEAD = null, SHOWN = null, LIVE = false;

function lunarOf(d) { return Solar.fromYmdHms(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12, 0, 0).getLunar(); }
function render() {
    const l = lunarOf(DAY), now = new Date(), isToday = DAY.toDateString() === now.toDateString();
    const chong = ZHI.indexOf(l.getDayChong()), shaPal = SHA_PAL[l.getDaySha()];
    const spirits = SPIRITS.map(s => ({ ...s, p: TRI_PAL[l['getDayPosition' + s.k]()] }));
    let kua = 0;
    try { const b = localStorage.getItem('luopan_birthDate'); if (b && !isNaN(new Date(b))) kua = personKuaOf(getExactPillars(new Date(b)).solarYear, localStorage.getItem('luopan_gender') || 'M'); } catch (e) {}
    const row = kua ? PERSON_8M_TABLE[kua] : null;
    // หัว
    let h = `<section class="card p-4 text-center">
        <div class="flex items-center justify-between"><button type="button" class="btn" id="prev" aria-label="วันก่อน">‹</button>
            <div><div class="text-[17px] font-bold text-white">${isToday ? 'วันนี้ · ' : ''}วัน${TH_DAY[DAY.getDay()]}ที่ ${DAY.getDate()} ${TH_MONTH[DAY.getMonth()]} ${DAY.getFullYear() + 543}</div>
            <div class="text-[12px] text-slate-400">วัน <span class="cn text-yellow-300">${l.getDayInGanZhi()}</span> · ปฏิทินจีน เดือน ${Math.abs(l.getMonth())}${l.getMonth() < 0 ? " (อธิกมาส)" : ""} วันที่ ${l.getDay()}</div></div>
            <button type="button" class="btn" id="next" aria-label="วันถัดไป">›</button></div>
        ${isToday ? '' : '<button type="button" id="todayBtn" class="text-[12px] text-sky-300 underline mt-1">กลับไปวันนี้</button>'}
        <div class="grid grid-cols-2 gap-2 mt-3 text-[12.5px]">
            <div class="rounded-xl p-2" style="background:#4c0519;border:1px solid #9f1239">⚠️ คนปี<b>${ZHI_TH[chong]}</b> ระวังวันนี้<div class="text-[11px] text-rose-200">วันชงกับปี${ZHI_TH[chong]}${cn(l.getDayChongDesc())}</div></div>
            <div class="rounded-xl p-2" style="background:#431407;border:1px solid #9a3412">🚫 ทิศอสูรวันนี้: <b>${PAL_TH[shaPal]}</b><div class="text-[11px] text-orange-200">ไม่ควรเริ่มงาน ขุด เจาะ ทางนี้${cn('煞')}</div></div>
        </div></section>`;
    // ทิศเทพ
    h += `<section class="card p-4" aria-labelledby="hDir"><h2 id="hDir" class="font-bold text-yellow-300">🧭 ทิศมงคลของวัน</h2>
        <div class="grid grid-cols-1 gap-2 mt-2">${spirits.map(s => `<div class="rounded-xl p-3 flex gap-3 items-start" style="background:#0b1220;border:1px solid ${s.col}66">
            <span class="text-2xl">${s.icon}</span><div class="flex-1"><div><b class="text-white">${s.th}</b>${cn(s.cn)} · <b style="color:${s.col === '#4f46e5' ? '#a5b4fc' : s.col === '#7c3aed' ? '#c4b5fd' : s.col}">${PAL_TH[s.p]}</b>${cn(PAL_TRI[s.p])} <span class="text-[11px] text-slate-500">${norm(s.p * 45 - 22.5).toFixed(1)}°–${norm(s.p * 45 + 22.5).toFixed(1)}°</span></div>
            <div class="text-[12.5px] text-slate-400 mt-0.5">${s.tip}</div></div></div>`).join('')}</div>
        ${row ? `<div class="text-[12.5px] mt-2 rounded-xl p-2.5" style="background:#052e1a;border:1px solid #166534">⭐ ทิศโชคประจำตัวคุณ (ใช้ได้ทุกวัน): <b>${PERSON_DIR_TH[row[0]]}</b>${cn('生氣')} · ถ้าวันนี้ตรงกับทิศเงินหรือทิศโชค ยิ่งดี</div>` : ''}
        <div class="mt-3"><div id="dialWrap"><svg id="dial" viewBox="-130 -130 260 260" width="100%" height="100%" aria-label="จานทิศมงคล"></svg><div id="needle" hidden></div></div>
            <button type="button" id="liveBtn" class="btn w-full mt-2">${LIVE ? '■ หยุด' : '🧭 ชี้หาทิศด้วยเข็มทิศ'}</button><div id="liveMsg" class="text-center text-[12px] text-amber-300 mt-1 min-h-[1em]"></div></div>
    </section>`;
    // ยาม
    const times = l.getTimes().slice(1);
    const curHm = now.getHours() * 60 + now.getMinutes();
    h += `<section class="card p-4" aria-labelledby="hTime"><h2 id="hTime" class="font-bold text-sky-300">⏰ ยามดี-ร้ายของวัน</h2>
        <div class="text-[12px] text-slate-400 mt-0.5">ยามดี (黃道) เหมาะเริ่มงาน เดินทาง เซ็นสัญญา · พร้อมทิศเงิน/โชคของยามนั้น</div>
        <div class="mt-2 divide-y divide-slate-800">${times.map(t => {
            const good = t.getTianShenLuck() === '吉', [a, b] = [t.getMinHm(), t.getMaxHm()];
            const am = +a.slice(0, 2) * 60 + +a.slice(3), bm = +b.slice(0, 2) * 60 + +b.slice(3);
            const cur = isToday && (am <= bm ? curHm >= am && curHm <= bm : curHm >= am || curHm <= bm);
            return `<div class="py-2 flex items-center gap-2 text-[13px] ${cur ? 'bg-yellow-900/30 rounded-lg px-2' : ''}">
                <span class="w-[92px] shrink-0 tabular-nums text-slate-300">${a}–${b}</span>
                <span class="w-[62px] shrink-0">ยาม${ZHI_TH[ZHI.indexOf(t.getZhi())]}</span>
                <span class="text-[12px] px-2 rounded-full shrink-0" style="${good ? 'background:#064e3b;color:#a7f3d0' : 'background:#3f3f46;color:#d4d4d8'}">${good ? 'ดี' : 'ธรรมดา'}</span>
                <span class="text-[11.5px] text-slate-400 truncate">💰${PAL_TH[TRI_PAL[t.getPositionCai()]]} 😊${PAL_TH[TRI_PAL[t.getPositionXi()]]}</span>${cur ? '<span class="text-[11px] text-yellow-300 shrink-0">◀ ตอนนี้</span>' : ''}</div>`;
        }).join('')}</div></section>`;
    // ควรทำ / ควรเลี่ยง
    const tr = (x) => YIJI_TH[x] ? `${YIJI_TH[x]}${cn(x)}` : `<span class="cn">${x}</span>`;
    h += `<section class="card p-4" aria-labelledby="hYi"><h2 id="hYi" class="font-bold text-emerald-300">📅 ปฏิทินจีน: วันนี้ควรทำ / ควรเลี่ยง</h2>
        <div class="grid grid-cols-2 gap-3 mt-2 text-[12.5px]">
            <div><div class="text-emerald-300 font-semibold mb-1">✅ ควรทำ ${cn('宜')}</div><ul class="space-y-0.5">${l.getDayYi().slice(0, 10).map(x => `<li>${tr(x)}</li>`).join('')}</ul></div>
            <div><div class="text-rose-300 font-semibold mb-1">⛔ ควรเลี่ยง ${cn('忌')}</div><ul class="space-y-0.5">${l.getDayJi().slice(0, 10).map(x => `<li>${tr(x)}</li>`).join('')}</ul></div>
        </div><p class="text-[11px] text-slate-500 mt-2">จากปฏิทินจีนมาตรฐาน (通書) ใช้ประกอบการตัดสินใจ งานใหญ่ เช่น ย้ายบ้าน แต่งงาน ควรดูฤกษ์ละเอียดกับดวงเจ้าของงาน</p></section>`;
    $('content').innerHTML = h;
    drawDial(spirits, shaPal);
    $('prev').onclick = () => { DAY = new Date(DAY.getTime() - 864e5); render(); };
    $('next').onclick = () => { DAY = new Date(DAY.getTime() + 864e5); render(); };
    if ($('todayBtn')) $('todayBtn').onclick = () => { DAY = new Date(); render(); };
    $('liveBtn').onclick = toggleLive;
    $('needle').hidden = !LIVE;
}

function drawDial(spirits, shaPal) {
    const P = (r, b) => { const a = b * Math.PI / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };
    const wedge = (r0, r1, b0, b1, fill) => { const [x0, y0] = P(r1, b0), [x1, y1] = P(r1, b1), [x2, y2] = P(r0, b1), [x3, y3] = P(r0, b0); return `<path d="M${x0},${y0} A${r1},${r1} 0 0 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 0 ${x3},${y3}Z" fill="${fill}" stroke="#334155"/>`; };
    let h = '<circle r="126" fill="#0b1220" stroke="#a16207" stroke-width="2.5"/>';
    for (let p = 0; p < 8; p++) {
        const c = p * 45, here = spirits.filter(s => s.p === p);
        h += wedge(40, 124, c - 22.5, c + 22.5, p === shaPal ? 'rgba(154,52,18,0.45)' : here.length ? 'rgba(202,138,4,0.18)' : 'transparent');
        const [x, y] = P(112, c); h += `<text x="${x}" y="${y}" font-size="10.5" fill="#e2e8f0" font-weight="700" text-anchor="middle" dominant-baseline="central">${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][p]}</text>`;
        here.forEach((s, i) => { const [ix, iy] = P(84 - i * 22, c); h += `<text x="${ix}" y="${iy}" font-size="17" text-anchor="middle" dominant-baseline="central">${s.icon}</text>`; });
        if (p === shaPal) { const [ix, iy] = P(84, c); h += `<text x="${ix}" y="${iy}" font-size="15" text-anchor="middle" dominant-baseline="central">🚫</text>`; }
    }
    h += '<circle r="38" fill="#0f172a" stroke="#475569"/>';
    $('dial').innerHTML = `<g id="rot">${h}</g><text y="-4" font-size="10" fill="#facc15" font-weight="700" text-anchor="middle" id="midT">${LIVE ? '▲ หัวเครื่อง' : '▲ เหนือ'}</text><text y="10" font-size="8.5" fill="#94a3b8" text-anchor="middle">💰😊🙏🍀</text>`;
}
async function toggleLive() {
    if (LIVE) { LIVE = false; headingStop(); render(); return; }
    LIVE = true; $('liveBtn').textContent = '■ หยุด'; $('needle').hidden = false; $('midT').textContent = '▲ หัวเครื่อง';
    $('liveMsg').textContent = 'ถือเครื่องแนวราบ หมุนตัวจนไอคอนที่ต้องการอยู่ใต้ลูกศรแดง';
    await headingStart((d) => { HEAD = d; }, (m) => { $('liveMsg').textContent = m; });
    const loop = () => { if (!LIVE) return; if (HEAD !== null) { SHOWN = SHOWN === null ? HEAD : norm(SHOWN + ((((HEAD - SHOWN + 540) % 360) - 180) * 0.2)); const g = document.getElementById('rot'); if (g) g.setAttribute('transform', `rotate(${(-SHOWN).toFixed(1)})`); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
}
render();
