// การคำนวณ: ปีฮวงจุ้ย (立春) สี่เสา Kua ทิศชง/ทิศอสูร ดาวจรรายปี
// ลองจิจูดสุริยะ (องศา) ใช้หาวัน 立春 (315°) เมื่อโหลด Lunar.js ไม่ได้
function sunLongitude(date) {
    const n = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    const L = 280.460 + 0.9856474 * n;
    const g = (357.528 + 0.9856003 * n) * Math.PI / 180;
    return (((L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360) + 360) % 360;
}
// ปีฮวงจุ้ย: เปลี่ยนปีที่เวลา 立春 จริง (ไม่ใช่ 1 ม.ค. หรือ 4 ก.พ. ตายตัว)
function solarYearOf(date, yearBranchFromBazi) {
    const y = date.getFullYear();
    if (yearBranchFromBazi !== undefined && yearBranchFromBazi >= 0) {
        return (((y - 4) % 12) + 12) % 12 === yearBranchFromBazi ? y : y - 1;
    }
    const lon = sunLongitude(date);
    return (date.getMonth() < 3 && lon >= 270 && lon < 315) ? y - 1 : y;
}



function getManualDayPillar(dt) {
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const d = dt.getDate();
    let jy = y, jm = m;
    if (jm <= 2) { jy -= 1; jm += 12; }
    let a = Math.floor(jy / 100);
    let b = 2 - a + Math.floor(a / 4);
    let jd = Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + d + b - 1524.5;
    let dayIndex = (Math.floor(jd + 0.5) - 11) % 60;
    if (dayIndex < 0) dayIndex += 60;
    return { gan: dayIndex % 10, zhi: dayIndex % 12 };
}

function getPillarsFallback(dt) {
    const y = solarYearOf(dt);
    const yBranch = (((y - 4) % 12) + 12) % 12;
    const mBranch = (dt.getMonth() + 1) % 12; 
    const dData = getManualDayPillar(dt);
    const hour = dt.getHours();
    const hBranch = Math.floor((hour + 1) % 24 / 2) % 12;
    
    return {
        year: yBranch, month: mBranch, day: dData.zhi, hour: hBranch, solarYear: y,
        bazi: { yg: 0, yz: yBranch, mg: 0, mz: mBranch, dg: dData.gan, dz: dData.zhi, hg: 0, hz: hBranch }
    };
}

function getExactPillars(dt) {
    try {
        if (typeof Solar !== 'undefined' && typeof Lunar !== 'undefined') {
            const solar = Solar.fromDate(dt);
            const lunar = solar.getLunar();
            const bazi = lunar.getEightChar();
            // Lunar.js ถือว่าเวลาที่ส่งเข้าไปเป็นเวลาจีน (UTC+8) แต่ไทยเป็น UTC+7
            // เสาปี/เดือน (ตัดที่เวลาสารทจริง) จึงต้องแปลงเป็นเวลาจีนก่อน ไม่งั้นคลาด 1 ชั่วโมง
            // ส่วนเสาวัน/ยาม ใช้เวลาท้องถิ่นตามเดิม
            const chinaWallClock = new Date(dt.getTime() + dt.getTimezoneOffset() * 60000 + 8 * 3600000);
            const baziCN = Solar.fromDate(chinaWallClock).getLunar().getEightChar();

            const yGanZhiStr = baziCN.getYear();
            const mGanZhiStr = baziCN.getMonth();
            const dGanZhiStr = bazi.getDay();
            const hGanZhiStr = bazi.getTime();

            const stemsArr = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
            const branchesArr = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
            
            const getZhiIdx = (str) => branchesArr.indexOf(str.charAt(1));
            const getGanIdx = (str) => stemsArr.indexOf(str.charAt(0));

            return {
                year: getZhiIdx(yGanZhiStr), month: getZhiIdx(mGanZhiStr), day: getZhiIdx(dGanZhiStr), hour: getZhiIdx(hGanZhiStr),
                solarYear: solarYearOf(dt, getZhiIdx(yGanZhiStr)),
                bazi: {
                    yg: getGanIdx(yGanZhiStr), yz: getZhiIdx(yGanZhiStr), 
                    mg: getGanIdx(mGanZhiStr), mz: getZhiIdx(mGanZhiStr), 
                    dg: getGanIdx(dGanZhiStr), dz: getZhiIdx(dGanZhiStr), 
                    hg: getGanIdx(hGanZhiStr), hz: getZhiIdx(hGanZhiStr) 
                }
            };
        }
    } catch (e) { 
        console.error("BaZi calculation failed, using fallback.", e);
    }
    return getPillarsFallback(dt);
}

function calculateAll() {
    state.date = new Date(els.targetDate.value); 
    state.birthDate = new Date(els.birthDate.value); 
    state.gender = els.gender.value;
    
    state.calc.timeBazi = getExactPillars(state.date);
    state.calc.personBazi = getExactPillars(state.birthDate);

    // Kua ใช้ปีฮวงจุ้ยของวันเกิด (คนเกิดก่อน 立春 นับเป็นปีก่อนหน้า)
    const by = state.calc.personBazi.solarYear;
    let sum = by.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    while (sum > 9) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    let kua = state.gender === 'M' ? 11 - sum : 4 + sum;
    if (kua > 9) kua -= 9; if (kua === 5) kua = state.gender === 'M' ? 2 : 8;
    state.calc.kua = kua; els.kuaDisplay.innerText = kua;

    const kuaGroups = { east: [1, 3, 4, 9], west: [2, 6, 7, 8] }; 
    const dirGroups = { east: ['N', 'S', 'E', 'SE'], west: ['W', 'NW', 'SW', 'NE'] };
    const group = kuaGroups.east.includes(kua) ? 'east' : 'west';
    state.calc.auspiciousDirs = dirGroups[group]; 
    state.calc.inauspiciousDirs = dirGroups[group === 'east' ? 'west' : 'east'];

    const getAffliction = (branchIdx) => {
        const clash = (branchIdx + 6) % 12; // 180 degrees opposite
        const trines = [[8,0,4], [11,3,7], [2,6,10], [5,9,1]];
        let ssStart = 0, ssEnd = 0, ssName = '';
        if(trines[0].includes(branchIdx)) { ssStart = 135; ssEnd = 225; ssName = 'ใต้'; } 
        else if(trines[1].includes(branchIdx)) { ssStart = 225; ssEnd = 315; ssName = 'ตะวันตก'; } 
        else if(trines[2].includes(branchIdx)) { ssStart = 315; ssEnd = 45; ssName = 'เหนือ'; } 
        else if(trines[3].includes(branchIdx)) { ssStart = 45; ssEnd = 135; ssName = 'ตะวันออก'; } 
        return { clash, ssStart, ssEnd, ssName };
    };
    
    ['year', 'month', 'day', 'hour'].forEach(p => { 
        state.calc.afflictions[p] = getAffliction(state.calc.timeBazi[p]); 
    });

    // ปีของดาวจรรายปี เปลี่ยนที่เวลา 立春 จริง (ตรงกับเสาปีของ Lunar.js)
    const actualYear = state.calc.timeBazi.solarYear;

    let centerStar = 3 - ((actualYear - 2024) % 9); 
    while (centerStar <= 0) centerStar += 9;
    while (centerStar > 9) centerStar -= 9;

    const luoShuPath = ['Center', 'NW', 'W', 'NE', 'S', 'N', 'SW', 'E', 'SE']; 
    const yearStars = {};
    let currentStar = centerStar;
    luoShuPath.forEach(dir => { 
        if (dir !== 'Center') yearStars[dir] = currentStar; 
        currentStar = currentStar === 9 ? 1 : currentStar + 1; 
    });
    state.calc.stars = { year: yearStars, center: centerStar };

    updateUI(); 
    updateStatusBadge(); 
    updateAdviceBox(state.currentDegree); 
    draw2DTexture();
}
