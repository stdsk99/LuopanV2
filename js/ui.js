// หน้าจอ: state, อ้างอิงองค์ประกอบ, เมนู, แผงวิเคราะห์, กล่องสถานะ, กล่องคำแนะนำทิศ
let state = {
    date: new Date(), birthDate: new Date(1981, 5, 25, 10, 16), gender: 'F', viewMode: 'TIME', is64GuaMode: false,
    toggles: { year: true, month: true, day: true, hour: true },
    calc: { timeBazi: {}, personBazi: {}, afflictions: {}, stars: {}, kua: 8, auspiciousDirs: [], inauspiciousDirs: [] },
    isCompassActive: false, currentDegree: 0
};

let isARTransparent = false;

const els = {
    targetDate: document.getElementById('targetDate'), setNowBtn: document.getElementById('setNowBtn'),
    birthDate: document.getElementById('birthDate'), gender: document.getElementById('gender'),
    kuaDisplay: document.getElementById('kuaDisplay'),
    togYear: document.getElementById('togYear'), togMonth: document.getElementById('togMonth'),
    togDay: document.getElementById('togDay'), togHour: document.getElementById('togHour'),
    layerBtns: document.querySelectorAll('.layer-btn'), timeBaziPanel: document.getElementById('timeBaziPanel'),
    personBaziPanel: document.getElementById('personBaziPanel'), afflictionSummary: document.getElementById('afflictionSummary'),
    degreeValue: document.getElementById('degreeValue'), dirLabel: document.getElementById('dirLabel'),
    dirAdvice: document.getElementById('dirAdvice'), adviceTitle: document.getElementById('adviceTitle'),
    adviceRemedy: document.getElementById('adviceRemedy'), statusBadge: document.getElementById('statusBadge'),
    compassBtn: document.getElementById('compassBtn'), arBtn: document.getElementById('arBtn'),
    manualDegree: document.getElementById('manualDegree'), manualRotationControl: document.getElementById('manualRotationControl'),
    menuBtn: document.getElementById('menuBtn'), quickLayerBtn: document.getElementById('quickLayerBtn'),
    sidebar: document.getElementById('sidebar'), closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    toastNotification: document.getElementById('toastNotification'), toastMessage: document.getElementById('toastMessage'),
    
    // Floor Plan Elements
    fpInput: document.getElementById('fpInput'), fpBtn: document.getElementById('fpBtn'),
    fpScale: document.getElementById('fpScale'), fpOpacity: document.getElementById('fpOpacity'),
    fpRotation: document.getElementById('fpRotation'), fpControls: document.getElementById('fpControls'),
    fpRemoveBtn: document.getElementById('fpRemoveBtn'), fpOffsetX: document.getElementById('fpOffsetX'),
    fpOffsetY: document.getElementById('fpOffsetY'), fpResetBtn: document.getElementById('fpResetBtn'),
    luopanScale: document.getElementById('luopanScale'), luopanOpacity: document.getElementById('luopanOpacity')
};

function showToast(msg) {
    els.toastMessage.innerText = msg;
    els.toastNotification.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
    els.toastNotification.classList.add('opacity-100', 'scale-100');
    setTimeout(() => {
        els.toastNotification.classList.remove('opacity-100', 'scale-100');
        els.toastNotification.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
    }, 4000);
}

const tzOffset = (new Date()).getTimezoneOffset() * 60000;
els.targetDate.value = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);

const savedBirthDate = localStorage.getItem('luopan_birthDate');
const savedGender = localStorage.getItem('luopan_gender');

if (savedBirthDate) { els.birthDate.value = savedBirthDate; state.birthDate = new Date(savedBirthDate); } 
else { els.birthDate.value = (new Date(state.birthDate - tzOffset)).toISOString().slice(0, 16); }
if (savedGender) { els.gender.value = savedGender; state.gender = savedGender; }

els.birthDate.addEventListener('change', (e) => { localStorage.setItem('luopan_birthDate', e.target.value); calculateAll(); });
els.gender.addEventListener('change', (e) => { localStorage.setItem('luopan_gender', e.target.value); calculateAll(); });
els.setNowBtn.addEventListener('click', () => { els.targetDate.value = (new Date(new Date() - tzOffset)).toISOString().slice(0, 16); calculateAll(); });
els.targetDate.addEventListener('change', () => { calculateAll(); });

function updateUI() {
    const renderPillar = (ganIdx, zhiIdx, labelTitle) => {
        const g = ganData[ganIdx]; const z = zhiData[zhiIdx];
        return `
            <div class="flex flex-col items-center p-1.5 bg-slate-900/60 rounded-lg border border-slate-700/80 shadow-sm relative overflow-hidden group">
                <div class="absolute inset-0 opacity-10 bg-gradient-to-b from-transparent to-black pointer-events-none"></div>
                <span class="text-[9px] md:text-[10px] text-slate-400 mb-1 tracking-wider relative z-10">${labelTitle}</span>
                <div class="text-xl md:text-2xl font-bold leading-none ${g.color} cn-char drop-shadow-md relative z-10">${g.char}</div>
                <div class="text-[9px] ${g.color} opacity-80 mb-0.5 relative z-10">${g.th} (${g.el})</div>
                <div class="w-[80%] h-px bg-slate-700/50 my-1 relative z-10"></div>
                <div class="text-xl md:text-2xl font-bold leading-none ${z.color} cn-char drop-shadow-md relative z-10">${z.char}</div>
                <div class="text-[9px] ${z.color} opacity-80 relative z-10">${z.th} (${z.el})</div>
            </div>`;
    };

    const t = state.calc.timeBazi.bazi;
    els.timeBaziPanel.innerHTML = renderPillar(t.yg, t.yz, 'ปี') + renderPillar(t.mg, t.mz, 'เดือน') + renderPillar(t.dg, t.dz, 'วัน') + renderPillar(t.hg, t.hz, 'ยาม');
    
    const p = state.calc.personBazi.bazi;
    els.personBaziPanel.innerHTML = renderPillar(p.yg, p.yz, 'ปี') + renderPillar(p.mg, p.mz, 'เดือน') + renderPillar(p.dg, p.dz, 'วัน') + renderPillar(p.hg, p.hz, 'ยาม');
    if (typeof renderHousePanel === 'function') renderHousePanel();
    if (typeof renderPersonDetail === 'function') renderPersonDetail();

    let sumHtml = '';
    Object.keys(state.toggles).forEach(k => {
        if (!state.toggles[k]) return;
        const aff = state.calc.afflictions[k];
        const label = k==='year'?'ปี':k==='month'?'เดือน':k==='day'?'วัน':'ยาม';
        const currentBranchIdx = state.calc.timeBazi[k];
        const bName = zhiData[currentBranchIdx].th; 
        
        const clashBranchData = zhiData[aff.clash];

        sumHtml += `
            <div class="border border-red-900/40 pb-2 mb-2 bg-red-950/20 px-2 py-1.5 rounded-lg shadow-sm">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-red-400 font-bold text-[11px] md:text-[12px] tracking-wide">▲ ทิศร้าย ${label}${bName}</span>
                </div>
                <div class="pl-2 border-l-2 border-red-900/50 space-y-1 mt-1.5 text-[10px] md:text-[11px]">
                   <div class="grid grid-cols-[30%_70%] gap-1">
                       <span class="text-red-300/80">ทิศแตก(ชง):</span> 
                       <span class="text-red-200">ทิศ${clashBranchData.th} (${clashBranchData.name.split(' ')[0]})</span>
                   </div>
                   <div class="grid grid-cols-[30%_70%] gap-1">
                       <span class="text-orange-400/80">ทิศอสูร:</span> 
                       <span class="text-orange-200">ฝั่งทิศ${aff.ssName}</span>
                   </div>
                   
                   <div class="mt-1.5 pt-1.5 border-t border-red-900/30">
                       <div class="text-[9px] text-red-400/70 mb-0.5">ผลกระทบหากกระทบกระเทือนทิศแตก:</div>
                       <div class="grid grid-cols-[30%_70%] gap-1 text-[9px] md:text-[10px] leading-tight">
                           <span class="text-slate-400">อวัยวะ/โรค:</span> <span class="text-slate-200">${clashBranchData.impact.organ}</span>
                           <span class="text-slate-400">บุคคล:</span> <span class="text-slate-200">${clashBranchData.impact.person}</span>
                           <span class="text-slate-400">เหตุการณ์:</span> <span class="text-slate-200">${clashBranchData.impact.event}</span>
                       </div>
                   </div>
                </div>
            </div>`;
    });
    els.afflictionSummary.innerHTML = sumHtml || '<div class="text-emerald-400 text-center py-4 bg-emerald-900/10 rounded-lg border border-emerald-900/30">✨ ไม่มีทิศร้ายจร<br>(หรือปิดการเช็คไว้)</div>';
}

function updateStatusBadge() {
    // ไม่ซ่อนกล่องสถานะอีกต่อไปแม้จะอยู่ในโหมด AR
    els.statusBadge.parentElement.style.display = 'flex';
    els.statusBadge.style.opacity = '1';

    let modeName = "", legendHtml = "", activeDetails = [];
    if (state.calc && state.calc.timeBazi) {
        if (state.toggles.year) activeDetails.push(`ปี${zhiData[state.calc.timeBazi.year].th}`);
        if (state.toggles.month) activeDetails.push(`เดือน${zhiData[state.calc.timeBazi.month].th}`);
        if (state.toggles.day) activeDetails.push(`วัน${zhiData[state.calc.timeBazi.day].th}`);
        if (state.toggles.hour) activeDetails.push(`ยาม${zhiData[state.calc.timeBazi.hour].th}`);
    }
    let activeText = activeDetails.length > 0 ? `(เช็ค: ${activeDetails.join(', ')})` : '(ปิดการเช็คกาลเวลา)';

    // เปลี่ยนไปใช้ clamp() เพื่อให้ฟอนต์ลื่นไหลบนจอแท็บเล็ต
    if (state.is64GuaMode || state.viewMode === '64GUA') {
        modeName = `<span class="text-indigo-400 font-bold text-[clamp(14px,3.5vmin,24px)]">📍 ผัง 64 ข่วย (Xuan Kong Da Gua)</span>`;
        legendHtml = `<div class="text-[clamp(11px,2.8vmin,18px)] text-slate-300 mt-1">ใช้ตรวจสอบความหมายของข่วย และตั้งหาฤกษ์ยามมงคลระดับสูง</div>`;
    } else if (state.viewMode === 'KUA') {
        modeName = `<span class="text-emerald-400 font-bold text-[clamp(14px,3.5vmin,24px)]">โหมด: เฉพาะทิศมงคลบุคคล (8 Mansions)</span>`;
        legendHtml = `<div class="flex justify-center gap-4 mt-2 pt-1.5 border-t border-slate-700/80 text-[clamp(12px,3vmin,20px)]"><span class="flex items-center gap-1.5 text-emerald-400"><span class="w-3 h-3 md:w-4 md:h-4 border-2 border-emerald-500 rounded-sm"></span>ทิศมงคล</span><span class="flex items-center gap-1.5 text-red-400"><span class="w-3 h-3 md:w-4 md:h-4 border-2 border-red-500 rounded-sm"></span>ทิศร้าย</span></div>`;
    } else if (state.viewMode === 'TIME') {
        modeName = `<span class="text-yellow-400 font-bold text-[clamp(14px,3.5vmin,24px)]">โหมด: แสดงทิศร้ายกาลเวลา</span><br><span class="text-[clamp(11px,2.8vmin,18px)] text-slate-300 font-normal mt-1 block">${activeText}</span>`;
        legendHtml = `<div class="flex justify-center gap-4 mt-2 pt-1.5 border-t border-slate-700/80 text-[clamp(12px,3vmin,20px)]"><span class="flex items-center gap-1.5 text-red-400"><span class="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-sm"></span>ทิศแตก(ชง)</span><span class="flex items-center gap-1.5 text-orange-400"><span class="w-4 h-1.5 md:w-6 md:h-2 bg-orange-500 rounded-full"></span>ทิศอสูร</span></div>`;
    } else if (state.viewMode === 'STARS') {
        modeName = `<span class="text-blue-400 font-bold text-[clamp(14px,3.5vmin,24px)]">โหมด: ดาวเหินประจำปี</span><br><span class="text-[clamp(11px,2.8vmin,18px)] text-slate-300 font-normal mt-1 block">(ปี${state.calc.timeBazi.solarYear} นับจาก 立春)</span>`;
        legendHtml = `<div class="flex justify-center gap-3 mt-2 pt-1.5 border-t border-slate-700/80 text-[clamp(12px,3vmin,20px)]"><span class="flex items-center gap-1 text-emerald-400">⭐มงคล</span><span class="flex items-center gap-1 text-red-400">⭐ร้าย</span><span class="flex items-center gap-1 text-yellow-400">⭐วิบัติ</span></div>`;
    } else if (state.viewMode === 'HOUSE') {
        // โหมดดาวเหินของบ้าน (js/flyingstar.js)
        const hf = house ? houseMountainOf(house.facing) : null;
        const sub = house ? `หัน <span class="cn-char">${HOUSE_M24[hf.m]}</span> ${house.facing.toFixed(1)}° · นั่ง <span class="cn-char">${HOUSE_M24[houseMountainOf(house.facing + 180).m]}</span> · ดาวจรปี ${state.calc.timeBazi.solarYear}` : 'ยังไม่ได้บันทึกทิศบ้าน';
        modeName = `<span class="text-blue-400 font-bold text-[clamp(14px,3.5vmin,24px)]">⭐ โหมด: ดาวเหินของบ้าน · ยุค ${housePeriod()}</span><br><span class="text-[clamp(11px,2.8vmin,18px)] text-slate-300 font-normal mt-1 block">${sub}</span>`;
        const btn = (houseMeasuring && state.isCompassActive)
            ? `<button onclick="houseSaveFacing(displayDegree)" class="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-4 py-1.5 text-[clamp(12px,3vmin,18px)]">📍 บันทึกทิศนี้เป็นหน้าบ้าน</button>`
            : `<button onclick="houseStartMeasure()" class="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-4 py-1.5 text-[clamp(12px,3vmin,18px)]">📍 ${house ? 'วัดทิศบ้านใหม่' : 'วัดทิศบ้าน'}</button>`;
        legendHtml = `<div class="flex justify-center gap-3 mt-2 pt-1.5 border-t border-slate-700/80 text-[clamp(11px,2.8vmin,18px)]"><span class="text-amber-400">ภูเขา</span><span class="text-blue-400">น้ำ</span><span class="text-slate-400">ยุค</span><span class="bg-amber-400 text-slate-900 rounded px-1">จรปี</span><span class="text-green-400">□ ดาวรุ่ง</span></div>${btn}`;
    }
    els.statusBadge.innerHTML = `<div class="flex flex-col text-yellow-500 mb-1">${modeName}</div>${legendHtml}`;
}

function setActiveMenuButton() {
    els.layerBtns.forEach(b => { 
        b.classList.remove('active'); 
        if (b.getAttribute('data-layer') === state.viewMode) b.classList.add('active'); 
    });
    if(state.viewMode === '64GUA') { 
        els.quickLayerBtn.classList.replace('border-indigo-500', 'border-yellow-500'); 
        els.quickLayerBtn.classList.replace('text-indigo-400', 'text-yellow-400'); 
    } else { 
        els.quickLayerBtn.classList.replace('border-yellow-500', 'border-indigo-500'); 
        els.quickLayerBtn.classList.replace('text-yellow-400', 'text-indigo-400'); 
    }
}

els.layerBtns.forEach(btn => { 
    btn.addEventListener('click', (e) => { 
        state.viewMode = e.currentTarget.getAttribute('data-layer'); 
        state.is64GuaMode = (state.viewMode === '64GUA'); 
        setActiveMenuButton(); 
        updateStatusBadge(); 
        draw2DTexture(); 
        updateAdviceBox(state.currentDegree); 
    }); 
});

els.quickLayerBtn.addEventListener('click', () => {
    if (state.viewMode === 'TIME') { state.viewMode = 'KUA'; state.is64GuaMode = false; } 
    else if (state.viewMode === 'KUA') { state.viewMode = 'STARS'; state.is64GuaMode = false; } 
    else if (state.viewMode === 'STARS') { state.viewMode = 'HOUSE'; state.is64GuaMode = false; } 
    else if (state.viewMode === 'HOUSE') { state.is64GuaMode = true; state.viewMode = '64GUA'; } 
    else { state.is64GuaMode = false; state.viewMode = 'TIME'; }
    setActiveMenuButton(); updateStatusBadge(); draw2DTexture(); updateAdviceBox(state.currentDegree);
});

els.tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        els.tabBtns.forEach(b => { b.classList.remove('text-yellow-400', 'border-yellow-500'); b.classList.add('text-slate-400', 'border-transparent'); });
        e.target.classList.remove('text-slate-400', 'border-transparent'); e.target.classList.add('text-yellow-400', 'border-yellow-500');
        document.getElementById('tab-config').classList.add('hidden'); 
        document.getElementById('tab-analysis').classList.add('hidden');
        document.getElementById(`tab-${e.target.getAttribute('data-tab')}`).classList.remove('hidden');
        if(e.target.getAttribute('data-tab') === 'analysis') {
            document.getElementById('tab-analysis').classList.add('flex');
        } else {
            document.getElementById('tab-analysis').classList.remove('flex');
        }
    });
});

els.menuBtn.addEventListener('click', () => { els.sidebar.classList.add('open'); });
els.closeSidebarBtn.addEventListener('click', () => { els.sidebar.classList.remove('open'); });

['togYear', 'togMonth', 'togDay', 'togHour'].forEach(id => { 
    els[id].addEventListener('change', (e) => { 
        state.toggles[id.replace('tog', '').toLowerCase()] = e.target.checked; 
        updateUI(); updateStatusBadge(); 
        draw2DTexture(); 
        updateAdviceBox(state.currentDegree); 
    }); 
});


function getDirectionData(deg) { 
    for (let k in dirs8) { 
        let d = dirs8[k]; 
        if (d.start > d.end) { 
            if (deg >= d.start || deg <= d.end) return { code: k, name: d.name }; 
        } else { 
            if (deg >= d.start && deg <= d.end) return { code: k, name: d.name }; 
        } 
    } 
    return { code: 'N', name: 'เหนือ' }; 
}

function updateAdviceBox(deg) {
    const dirData = getDirectionData(deg); const dirCode = dirData.code; 
    els.dirLabel.innerText = `${dirData.name} (${dirCode})`; 
    els.degreeValue.innerText = deg.toFixed(1) + '°';
    let title = "", remedy = "", hasBad = false;
    if (state.viewMode !== 'HOUSE') els.dirAdvice.classList.replace('border-emerald-500', 'border-slate-300');

    if (state.is64GuaMode || state.viewMode === '64GUA') {
        const guaWidth = 5.625; const margin = 0.5; const boundaryDistance = deg % guaWidth; 
        const isKongWang = boundaryDistance <= margin || (guaWidth - boundaryDistance) <= margin;
        if (isKongWang) {
            title = "⚠️ ระวัง! ทับเส้นแบ่งข่วย (เส้นมรณะ)"; remedy = "พลังงานปะทะกันรุนแรง ห้ามเคาะเจาะทุบ ตั้งประตู โต๊ะทำงาน ทับองศานี้เด็ดขาด";
            els.dirAdvice.classList.replace('border-slate-300', 'border-red-500'); 
            els.dirAdvice.classList.replace('border-indigo-500', 'border-red-500'); 
            els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-red-600';
        } else {
            const ringIndex = Math.floor(deg / guaWidth) % 64;
            const guaData = gua64Info[FUXI_RING[ringIndex] - 1].split('|');
            title = `☯️ ข่วย${guaData[0]}`; remedy = guaData[1];
            els.dirAdvice.classList.replace('border-red-500', 'border-indigo-500'); 
            els.dirAdvice.classList.replace('border-slate-300', 'border-indigo-500'); 
            els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-indigo-600';
        }
    } else if (state.viewMode === 'HOUSE') {
        // คำแนะนำของวังที่ชี้อยู่ ตามผังดาวเหินของบ้าน (js/flyingstar.js)
        const adv = houseAdvice(deg);
        title = adv.title; remedy = adv.remedy;
        ['border-slate-300', 'border-red-500', 'border-orange-500', 'border-indigo-500', 'border-emerald-500'].forEach(c => els.dirAdvice.classList.remove(c));
        const tone = { fatal: ['border-red-500', 'text-red-600'], bad: ['border-orange-500', 'text-orange-600'], good: ['border-emerald-500', 'text-emerald-600'], normal: ['border-slate-300', 'text-slate-700'] }[adv.level];
        els.dirAdvice.classList.add(tone[0]);
        els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 ' + tone[1];
        hasBad = adv.level === 'fatal' || adv.level === 'bad';
    } else if (state.viewMode === 'STARS') {
        const starNum = state.calc.stars.year[dirCode];
        if (starNum) {
            title = starsInfo[starNum].desc; remedy = starsInfo[starNum].remedy;
            if(starsInfo[starNum].type === 'fatal') { 
                els.dirAdvice.classList.replace('border-slate-300', 'border-red-500'); 
                els.dirAdvice.classList.replace('border-indigo-500', 'border-red-500'); 
                els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-red-600'; hasBad = true; 
            } else if (starsInfo[starNum].type === 'bad') { 
                els.dirAdvice.classList.replace('border-slate-300', 'border-orange-500'); 
                els.dirAdvice.classList.replace('border-indigo-500', 'border-orange-500'); 
                els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-orange-600'; 
            } else { 
                els.dirAdvice.classList.replace('border-red-500', 'border-slate-300'); 
                els.dirAdvice.classList.replace('border-orange-500', 'border-slate-300'); 
                els.dirAdvice.classList.replace('border-indigo-500', 'border-slate-300'); 
                els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-emerald-600'; 
            }
        }
    } else if (state.viewMode === 'KUA') {
        const pst = (typeof personStarOf === 'function') ? personStarOf(dirCode) : null; // ดาว 八宅 ของทิศนี้ (js/person.js)
        if (state.calc.auspiciousDirs.includes(dirCode)) { 
            title = pst ? `ทิศมงคล · ${pst.c} ${pst.th}` : "ทิศมงคลประจำตัว"; remedy = pst ? pst.tip : "ส่งเสริมโชคลาภ สุขภาพ ความสัมพันธ์"; 
            els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-emerald-600'; 
        } else { 
            title = pst ? `ทิศร้าย · ${pst.c} ${pst.th}` : "ทิศร้ายประจำตัว"; remedy = pst ? pst.tip : "หลีกเลี่ยงการหันหัวเตียง หรือโต๊ะทำงาน"; 
            els.dirAdvice.classList.replace('border-slate-300', 'border-red-500'); 
            els.dirAdvice.classList.replace('border-indigo-500', 'border-red-500'); 
            els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-red-600'; hasBad = true; 
        }
        if(!hasBad) { 
            els.dirAdvice.classList.replace('border-red-500', 'border-slate-300'); 
            els.dirAdvice.classList.replace('border-indigo-500', 'border-slate-300'); 
        }
    } else if (state.viewMode === 'TIME') {
        let badTitle = []; let currentBranch = Math.floor((deg + 15) % 360 / 30);
        Object.keys(state.toggles).filter(k=>state.toggles[k]).forEach(p => {
             const aff = state.calc.afflictions[p]; 
             const thName = (p==='year'?'ปี':p==='month'?'เดือน':p==='day'?'วัน':'ยาม');
             if(aff.clash === currentBranch) badTitle.push(`ทิศชง(${thName})`);
             
             let inSS = false; 
             if(aff.ssStart > aff.ssEnd) { 
                 if(deg >= aff.ssStart || deg <= aff.ssEnd) inSS = true; 
             } else { 
                 if(deg >= aff.ssStart && deg <= aff.ssEnd) inSS = true; 
             }
             if(inSS) badTitle.push(`ทิศอสูร(${thName})`);
        });

        if(badTitle.length > 0) { 
            title = "⚠️ " + badTitle.join(', '); remedy = "ห้ามเคาะ เจาะ ทุบ ตอก ซ่อมแซม ในทิศนี้เด็ดขาด!"; 
            els.dirAdvice.classList.replace('border-slate-300', 'border-red-500'); 
            els.dirAdvice.classList.replace('border-indigo-500', 'border-red-500'); 
            els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-red-600'; hasBad = true; 
        } else { 
            title = "ทิศปกติ (กาลเวลาจร)"; remedy = "ไม่มีดาวร้ายจรปะทะ สามารถใช้งานได้ปกติ"; 
            els.dirAdvice.classList.replace('border-red-500', 'border-slate-300'); 
            els.dirAdvice.classList.replace('border-indigo-500', 'border-slate-300'); 
            els.adviceTitle.className = 'font-bold text-[clamp(14px,3.5vmin,24px)] tracking-wide leading-tight mb-1 text-slate-700'; 
        }
    }

    if(title) { 
        els.adviceTitle.innerText = title; 
        els.adviceRemedy.innerText = remedy; 
        els.dirAdvice.classList.remove('hidden'); 
        setTimeout(() => { 
            els.dirAdvice.classList.remove('opacity-0', 'scale-95'); 
            els.dirAdvice.classList.add('opacity-100', 'scale-100'); 
        }, 50); 
    } else { 
        els.dirAdvice.classList.add('opacity-0', 'scale-95'); 
        setTimeout(() => els.dirAdvice.classList.add('hidden'), 300); 
    }
}
