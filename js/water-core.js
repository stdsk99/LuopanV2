// จุดวางน้ำ/ประตู และจุดที่ควรสูง/ทึบ (สูตรล้วน) รวมหลายวิชาเป็นคะแนนต่อวัง
// น้ำ/ประตู: ประตูเมือง 城門 · ดาวน้ำรุ่ง/กำลังมา · 零神 (นอกบ้านควรมีน้ำ) · ทิศน้ำของ 7 ดาวขโมยโชค (64 ข่วย)
// สูง/ทึบ: ดาวภูเขารุ่ง/กำลังมา · 正神 · ทิศมังกรของ 7 ดาวขโมยโชค
// น้ำหนักคะแนนแอปกำหนดเอง ใช้เรียงลำดับ ไม่ใช่สูตรจากตำรา

function houseWaterGuide(ch, facing) {
    const C = ch.C, gates = houseGates(ch), zero = houseZeroDirs(C), rb = houseRobbery64(facing);
    const ling = zero.find(z => z.k === 'ling'), zheng = zero.find(z => z.k === 'zheng');
    const palOfDeg = (d) => houseMountainOf(d).palace;
    const rows = [0, 1, 2, 3, 4, 5, 6, 7].map(p => ({ p, water: 0, mount: 0, wr: [], mr: [], warn: [] }));
    const add = (p, kind, n, t, cn) => { const r = rows[p]; if (kind === 'w') { r.water += n; if (t) r.wr.push({ t, cn, n }); } else { r.mount += n; if (t) r.mr.push({ t, cn, n }); } };
    gates.forEach(g => add(g.pal, 'w', 3, `ประตูเมือง ภูเขา ${HOUSE_M24[g.m]} (${g.a.toFixed(1)}°–${g.b.toFixed(1)}°) ดึงพลังยุคเข้าบ้าน`, '城門'));
    for (let p = 0; p < 8; p++) {
        const w = ch.ft.g[p], m = ch.mt.g[p], tw = houseTimeliness(w, C).k, tm = houseTimeliness(m, C).k;
        if (tw === 'wang') add(p, 'w', 3, `ดาวน้ำ ${w} รุ่ง (ดาวเงินของยุค)`, '旺向星');
        else if (tw === 'sheng') add(p, 'w', 2, `ดาวน้ำ ${w} กำลังมา`, '生氣');
        if (tm === 'wang') { add(p, 'm', 3, `ดาวภูเขา ${m} รุ่ง (ดาวคนของยุค)`, '旺山星'); }
        else if (tm === 'sheng') add(p, 'm', 2, `ดาวภูเขา ${m} กำลังมา`, '生氣');
        if (w === 5) { rows[p].water = -99; rows[p].warn.push('ดาวน้ำ 5 ร้าย ห้ามวางน้ำ/เปิดประตูหลัก'); }
        if (ch.an.g[p] === 5) rows[p].warn.push('ปีนี้ดาวจร 5 ห้ามขุด เจาะ หรือเริ่มติดตั้งของใหม่ทิศนี้');
    }
    if (ling) add(ling.pal, 'w', 2, `零神 ทิศนอกบ้านควรมีน้ำ/ที่ต่ำ (ยุค ${C})`, '零神');
    if (zheng) add(zheng.pal, 'm', 2, `正神 ทิศนอกบ้านควรสูง (ยุค ${C})`, '正神');
    if (!rb.none) {
        add(palOfDeg(rb.water.mid), 'w', 1, `ทิศน้ำ 7 ดาวขโมยโชค (${rb.water.a.toFixed(1)}°–${rb.water.b.toFixed(1)}°)`, '七星打劫');
        add(palOfDeg(rb.dragon.mid), 'm', 1, `ทิศมังกร 7 ดาวขโมยโชค (${rb.dragon.a.toFixed(1)}°–${rb.dragon.b.toFixed(1)}°)`, '七星打劫');
    }
    // ทิศที่มีทั้งเหตุผลฝั่งน้ำและฝั่งสูง: ใกล้บ้านโล่ง/มีน้ำ ไกลออกไปมีที่สูง (หรือในบ้านแบ่งมุม)
    rows.forEach(r => { if (r.water > 0 && r.mount > 0) r.both = 'ทิศนี้มีทั้งเหตุผลให้มีน้ำและให้สูง: ใกล้บ้านให้โล่งหรือมีน้ำ ไกลออกไปให้มีตึกหรือที่สูง'; if (r.water < 0) r.water = 0; });
    const water = rows.filter(r => r.water > 0 && r.wr.length).sort((a, b) => b.water - a.water);
    const mount = rows.filter(r => r.mount > 0 && r.mr.length).sort((a, b) => b.mount - a.mount);
    return { rows, water, mount, gates, rb };
}
