// จานหล่อแก 3 มิติ (Three.js): ฉาก แปลนบ้าน จัดขนาดตามจอ และวาดหน้าปัด
const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3)); 
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas3dContainer').appendChild(renderer.domElement);

const canvas2d = document.createElement('canvas');
const ctx = canvas2d.getContext('2d');
// จอเล็กใช้ texture 2048 (ใช้หน่วยความจำ 16MB แทน 64MB) จอใหญ่ใช้ 4096
const screenPx = Math.max(window.innerWidth, window.innerHeight) * Math.min(window.devicePixelRatio || 1, 3);
const texSize = Math.min(renderer.capabilities.maxTextureSize || 4096, screenPx > 2200 ? 4096 : 2048);
canvas2d.width = texSize; 
canvas2d.height = texSize;
const texture = new THREE.CanvasTexture(canvas2d); 
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
texture.minFilter = THREE.LinearMipmapLinearFilter; 
texture.magFilter = THREE.LinearFilter;

const outerRadius = 5; const innerRadius = 0.05; 
const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
const luopanMesh = new THREE.Mesh(geometry, material); 
luopanMesh.rotation.x = -Math.PI / 2; 
scene.add(luopanMesh);

const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, transparent: true, opacity: 0.6 });
const lineGeo = new THREE.BufferGeometry().setFromPoints([ 
    new THREE.Vector3(0, -5, 0.05), new THREE.Vector3(0, 5, 0.05), 
    new THREE.Vector3(-5, 0, 0.05), new THREE.Vector3(5, 0, 0.05) 
]);
const crosshair = new THREE.LineSegments(lineGeo, lineMat); 
crosshair.rotation.x = -Math.PI / 2; 
scene.add(crosshair);

// ชั้นไฮไลต์ทิศชงที่กะพริบ: วาดครั้งเดียวลง texture เล็ก แล้วเปลี่ยนแค่ความโปร่งใสทุกเฟรม
// (เดิมวาด texture 4096×4096 ใหม่ทุกเฟรม ทำให้มือถือร้อนและกระตุก)
const pulseCanvas = document.createElement('canvas');
pulseCanvas.width = pulseCanvas.height = 1024;
const pulseCtx = pulseCanvas.getContext('2d');
const pulseTexture = new THREE.CanvasTexture(pulseCanvas);
const pulseMaterial = new THREE.MeshBasicMaterial({ map: pulseTexture, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
const pulseMesh = new THREE.Mesh(new THREE.RingGeometry(innerRadius, outerRadius, 128), pulseMaterial);
pulseMesh.position.z = 0.01; pulseMesh.renderOrder = 2; pulseMesh.visible = false;
luopanMesh.add(pulseMesh); // หมุนและย่อขยายไปพร้อมจาน
let hasPulse = false;

// ลูกศรชี้ทิศที่ขอบบนของจาน (ไม่หมุน) ใช้อ่านองศาเมื่อกล่ององศาย้ายไปไว้ข้างจาน
const markerShape = new THREE.Shape();
markerShape.moveTo(0, 4.72); markerShape.lineTo(-0.2, 5.12); markerShape.lineTo(0.2, 5.12); markerShape.closePath();
const topMarker = new THREE.Mesh(new THREE.ShapeGeometry(markerShape), new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }));
topMarker.rotation.x = -Math.PI / 2; topMarker.position.y = 0.08; topMarker.renderOrder = 3;
scene.add(topMarker);

const centerRingGeo = new THREE.RingGeometry(0.3, 0.35, 64);
const centerRingMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat); 
centerRing.rotation.x = -Math.PI / 2; 
centerRing.position.y = 0.05; 
scene.add(centerRing);

let floorPlanMesh = null;
let baseFpWidth = 10;
let baseFpHeight = 10;

els.fpBtn.addEventListener('click', () => els.fpInput.click());

els.fpInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const fpTexture = new THREE.Texture(img);
            fpTexture.needsUpdate = true;
            
            const aspect = img.width / img.height;
            baseFpHeight = 10; 
            baseFpWidth = 10 * aspect;
            
            if (floorPlanMesh) {
                scene.remove(floorPlanMesh);
                floorPlanMesh.geometry.dispose();
                floorPlanMesh.material.dispose();
            }
            
            const fpGeo = new THREE.PlaneGeometry(baseFpWidth, baseFpHeight);
            const fpMat = new THREE.MeshBasicMaterial({ 
                map: fpTexture, 
                transparent: true, 
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            floorPlanMesh = new THREE.Mesh(fpGeo, fpMat);
            floorPlanMesh.rotation.x = -Math.PI / 2;
            floorPlanMesh.position.y = -0.1; // Place slightly below the Luopan
            scene.add(floorPlanMesh);
            
            els.fpScale.value = 1;
            els.fpOpacity.value = 0.5;
            els.fpRotation.value = 0;
            els.fpOffsetX.value = 0;
            els.fpOffsetY.value = 0;
            document.getElementById('fpScaleVal').innerText = '1.0x';
            document.getElementById('fpOpacityVal').innerText = '50%';
            document.getElementById('fpRotationVal').innerText = '0°';
            document.getElementById('fpOffsetXVal').innerText = '0.0';
            document.getElementById('fpOffsetYVal').innerText = '0.0';
            els.fpControls.classList.remove('hidden');

            /* ปรับความโปร่งใสของจานหล่อแกอัตโนมัติให้เหลือ 60% เมื่อโหลดแปลนเสร็จ */
            els.luopanOpacity.value = 0.6;
            els.luopanOpacity.dispatchEvent(new Event('input'));

            showToast("โหลดแปลนบ้านสำเร็จ");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

els.fpScale.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('fpScaleVal').innerText = val.toFixed(1) + 'x';
    if(floorPlanMesh) floorPlanMesh.scale.set(val, val, 1);
});

els.fpOpacity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('fpOpacityVal').innerText = Math.round(val * 100) + '%';
    if(floorPlanMesh) floorPlanMesh.material.opacity = val;
});

els.fpRotation.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('fpRotationVal').innerText = val + '°';
    if(floorPlanMesh) floorPlanMesh.rotation.z = -val * (Math.PI / 180);
});

els.fpOffsetX.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('fpOffsetXVal').innerText = val.toFixed(1);
    if(floorPlanMesh) floorPlanMesh.position.x = val;
});

els.fpOffsetY.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('fpOffsetYVal').innerText = val.toFixed(1);
    if(floorPlanMesh) floorPlanMesh.position.z = val;
});

els.fpResetBtn.addEventListener('click', () => {
    if(!floorPlanMesh) return;
    els.fpScale.value = 1; els.fpScale.dispatchEvent(new Event('input'));
    els.fpOpacity.value = 0.5; els.fpOpacity.dispatchEvent(new Event('input'));
    els.fpRotation.value = 0; els.fpRotation.dispatchEvent(new Event('input'));
    els.fpOffsetX.value = 0; els.fpOffsetX.dispatchEvent(new Event('input'));
    els.fpOffsetY.value = 0; els.fpOffsetY.dispatchEvent(new Event('input'));
    showToast("รีเซ็ตค่าแปลนบ้านแล้ว");
});

els.luopanScale.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('luopanScaleVal').innerText = val.toFixed(1) + 'x';
    if(luopanMesh) luopanMesh.scale.set(val, val, 1);
    if(centerRing) centerRing.scale.set(val, val, 1);
    if(crosshair) crosshair.scale.set(val, val, 1);
    if(topMarker) topMarker.scale.set(val, val, 1);
});

els.luopanOpacity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('luopanOpacityVal').innerText = Math.round(val * 100) + '%';
    if(luopanMesh) luopanMesh.material.opacity = val;
});

els.fpRemoveBtn.addEventListener('click', () => {
    if(floorPlanMesh) {
        scene.remove(floorPlanMesh);
        floorPlanMesh.geometry.dispose();
        floorPlanMesh.material.dispose();
        floorPlanMesh = null;
    }
    els.fpInput.value = '';
    els.fpControls.classList.add('hidden');
    showToast("ลบแปลนบ้านเรียบร้อยแล้ว");
});

// ===== Responsive: จัดขนาดจานให้พอดีจอทุกขนาด และบอกตำแหน่งให้ CSS วางกล่องรอบจาน =====
// จอแนวตั้ง: จานกว้างเกือบเต็มจอ กล่ององศาอยู่เหนือจาน กล่องสถานะ/แถบเลื่อนอยู่ใต้จาน
// จอแนวนอน (กว้าง ≥ 1.25 เท่าของสูง): จานสูงเกือบเต็มจอ กล่องย้ายไปไว้ซ้าย-ขวาของจาน
const DIAL_WORLD_RADIUS = 5;
let dialPx = 0;
function onWindowResize() {
    const container = document.getElementById('canvas3dContainer');
    if(!container || container.clientWidth === 0) return;
    const width = container.clientWidth, height = container.clientHeight;
    const aspect = width / height;
    const side = aspect >= 1.25;
    document.body.classList.toggle('side-layout', side);

    if (side) {
        const sideMin = Math.min(460, Math.max(220, width * 0.24));
        dialPx = Math.min(height * 0.94, width - 2 * sideMin);
    } else {
        const reserve = Math.min(270, height * 0.24); // พื้นที่บน/ล่างสำหรับกล่ององศา คำเตือน และกล่องสถานะ
        dialPx = Math.min(width * 0.94, height - 2 * reserve);
    }
    dialPx = Math.max(dialPx, Math.min(width, height) * 0.5);

    /* จานหล่อแกอยู่กึ่งกลางจอ: ตั้งความสูงกล้องให้รัศมีจานเท่ากับ dialPx/2 พิกเซล */
    const fovRad = (camera.fov / 2) * (Math.PI / 180);
    const pxPerUnit = (dialPx / 2) / DIAL_WORLD_RADIUS;
    const camY = ((height / 2) / pxPerUnit) / Math.tan(fovRad);
    camera.aspect = aspect;
    camera.position.set(0, camY, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    const root = document.documentElement.style;
    const dialTop = height / 2 - (dialPx / 2) * 0.96; // ขอบวงองศา (0.96 ของรัศมี)
    root.setProperty('--deg-bottom', Math.min(height - dialTop + 14, height - 70) + 'px');
    root.setProperty('--side-w', Math.max(0, (width - dialPx) / 2) + 'px');
    const fab = document.getElementById('fabLeft');
    const fabBottom = fab ? fab.getBoundingClientRect().bottom : 170;
    root.setProperty('--side-top', (fabBottom + 14) + 'px');
}
window.addEventListener('resize', onWindowResize);
window.addEventListener('orientationchange', () => setTimeout(onWindowResize, 200));
if (window.visualViewport) window.visualViewport.addEventListener('resize', onWindowResize);
onWindowResize();

function draw2DTexture() {
    const size = texSize; const cx = size / 2; const cy = size / 2;
    ctx.clearRect(0, 0, size, size);
    hasPulse = false;
    const rTicks = size * 0.48; const rBrn = size * 0.38; 
    const rDir = size * 0.28; const rStar = size * 0.16; const rTai = size * 0.08;

    ctx.save(); ctx.translate(cx, cy);
    
    const drawSeg = (rIn, rOut, sDeg, eDeg, fill, stroke, lWidth = 2) => {
        ctx.beginPath(); 
        ctx.arc(0, 0, rOut, (sDeg - 90) * Math.PI / 180, (eDeg - 90) * Math.PI / 180);
        ctx.arc(0, 0, rIn, (eDeg - 90) * Math.PI / 180, (sDeg - 90) * Math.PI / 180, true); 
        ctx.closePath();
        if (fill !== 'transparent') { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke !== 'transparent') { ctx.strokeStyle = stroke; ctx.lineWidth = lWidth; ctx.stroke(); }
    };

    const drawTxt = (txt, radius, deg, color, font, outline = 'transparent', lw = 2) => {
        ctx.save(); 
        ctx.rotate((deg - 90) * Math.PI / 180); 
        ctx.translate(radius, 0); 
        ctx.rotate(Math.PI / 2); 
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = font;
        if(outline !== 'transparent') { 
            ctx.strokeStyle = outline; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 0); 
        }
        ctx.fillStyle = color; ctx.fillText(txt, 0, 0); 
        ctx.restore();
    };

    const baseFontSize = size * 0.035; const innerFontSize = baseFontSize * 0.5;

    let baseBgColor = isARTransparent ? 'rgba(15, 23, 42, 0.6)' : '#0f172a';
    let darkBgColor = isARTransparent ? 'rgba(10, 15, 29, 0.6)' : '#0a0f1d';

    if (state.is64GuaMode || state.viewMode === '64GUA') {
        ctx.beginPath(); ctx.arc(0,0, rTicks, 0, 2*Math.PI); ctx.fillStyle = darkBgColor; ctx.fill(); 
        const ringColor = 'rgba(212,175,55,0.4)';
        
        for(let i = 0; i < 64; i++) {
            drawSeg(rDir, rTicks, i*(360/64), (i+1)*(360/64), 'transparent', ringColor, 1.5);
            const hexagramUnicode = String.fromCharCode(0x4DC0 + FUXI_RING[i] - 1);
            drawTxt(hexagramUnicode, rDir + (rTicks-rDir)*0.6, i*(360/64) + (360/128), '#fcd34d', `900 ${baseFontSize*1.5}px Arial`, 'transparent');
        }
        // เส้นแบ่งกลุ่ม 8 ข่วย (ทุก 45° เริ่มที่ทิศเหนือ)
        for(let i = 0; i < 8; i++) drawSeg(rDir, rTicks, i*45, i*45, 'transparent', 'rgba(212,175,55,0.9)', 4);
        for(let i = 0; i < 8; i++) {
            drawSeg(rStar, rDir, i*45-22.5, i*45+22.5, 'transparent', ringColor, 2);
            drawTxt(EARLY_HEAVEN_TRIGRAMS[i], rStar + (rDir-rStar)*0.5, i*45, '#d4af37', `900 ${baseFontSize*2}px Arial`, 'transparent');
        }
        drawSeg(rTai, rStar, 0, 360, 'transparent', ringColor, 2); 
        drawTxt("ผัง 64 ข่วย", rTai * 1.6, 0, '#ffffff', `600 ${baseFontSize*0.6}px Prompt`, 'rgba(0,0,0,0.8)', 6);
    } else {
        ctx.beginPath(); ctx.arc(0,0, rTicks, 0, 2*Math.PI); ctx.fillStyle = baseBgColor; ctx.fill(); 
        const ringColor = 'rgba(212,175,55,0.4)';
        
        for(let i = 0; i < 24; i++) drawSeg(rBrn, rTicks, i*15-7.5, i*15+7.5, 'transparent', ringColor, 2);
        for(let i = 0; i < 12; i++) drawSeg(rDir, rBrn, i*30-15, i*30+15, 'transparent', ringColor, 2);
        for(let i = 0; i < 8; i++) drawSeg(rStar, rDir, i*45-22.5, i*45+22.5, 'transparent', ringColor, 2);
        drawSeg(rTai, rStar, 0, 360, 'transparent', ringColor, 2); 
        
        const vm = state.viewMode; 
        const activeSuiPos = []; let activeSanShas = [];
        if (vm === 'TIME') { 
            Object.keys(state.toggles).filter(k => state.toggles[k]).forEach(p => { 
                const aff = state.calc.afflictions[p]; 
                activeSuiPos.push({ branch: aff.clash, p: p }); 
                activeSanShas.push(aff); 
            }); 
        }

        mountains24.forEach((m) => { 
            const txt = m.name.split(' '); 
            drawTxt(txt[0], rBrn + (rTicks - rBrn) * 0.70, m.deg, '#cbd5e1', `bold ${baseFontSize * 0.65}px Arial`, 'transparent'); 
            drawTxt(txt[1], rBrn + (rTicks - rBrn) * 0.35, m.deg, '#ffffff', `600 ${baseFontSize * 0.9}px Prompt`, 'transparent'); 
        });

        // ไฮไลต์ทิศชง: ขอบแดงวาดในจานหลัก ส่วนพื้นสีแดงที่กะพริบอยู่ในชั้น pulseMesh
        const pc = pulseCtx, ps = pulseCanvas.width / size;
        pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, pulseCanvas.width, pulseCanvas.height);
        pc.setTransform(ps, 0, 0, ps, pulseCanvas.width / 2, pulseCanvas.height / 2);
        hasPulse = false;
        for (let i = 0; i < 12; i++) {
            const clashData = activeSuiPos.filter(a => a.branch === i);
            if (clashData.length > 0 && vm === 'TIME') {
                drawSeg(rDir, rBrn, i*30-15, i*30+15, 'transparent', '#ef4444', 4);
                pc.beginPath();
                pc.arc(0, 0, rBrn, (i*30-15-90) * Math.PI / 180, (i*30+15-90) * Math.PI / 180);
                pc.arc(0, 0, rDir, (i*30+15-90) * Math.PI / 180, (i*30-15-90) * Math.PI / 180, true);
                pc.closePath(); pc.fillStyle = 'rgb(239, 68, 68)'; pc.fill();
                hasPulse = true;
            }
            drawTxt(branches[i].char, rDir + (rBrn - rDir) * 0.70, i * 30, '#ffffff', `bold ${innerFontSize * 1.3}px Arial`, 'transparent');
            drawTxt(branches[i].name.split(' ')[0], rDir + (rBrn - rDir) * 0.35, i * 30, '#ffffff', `600 ${innerFontSize * 2.3}px Prompt`, 'transparent');
        }

        Object.keys(dirs8).forEach(k => {
            const d = dirs8[k]; let mid = (d.start + d.end) / 2; if (d.start > d.end) mid = (d.start + d.end + 360) / 2;
            let engColor = '#d4af37'; let thColor = '#94a3b8';
            if (vm === 'KUA') {
                if (state.calc.auspiciousDirs.includes(k)) { 
                    engColor = '#10b981'; thColor = '#10b981'; 
                    drawSeg(rStar, rDir, d.start, d.end, 'rgba(16, 185, 129, 0.15)', '#10b981', 4); 
                } 
                else if (state.calc.inauspiciousDirs.includes(k)) { 
                    engColor = '#ef4444'; thColor = '#ef4444'; 
                    drawSeg(rStar, rDir, d.start, d.end, 'rgba(239, 68, 68, 0.15)', '#ef4444', 4); 
                }
            }
            drawTxt(k, rStar + (rDir - rStar) * 0.72, mid, engColor, `900 ${innerFontSize * 1.75}px Arial`, 'transparent');
            const thSize = d.name.length > 7 ? innerFontSize * 1.15 : innerFontSize * 1.6; 
            drawTxt(d.name, rStar + (rDir - rStar) * 0.28, mid, thColor, `500 ${thSize}px Prompt`, 'transparent');
        });

        if (vm === 'STARS') {
            Object.keys(dirs8).forEach(k => {
                const d = dirs8[k]; let mid = (d.start + d.end) / 2; if (d.start > d.end) mid = (d.start + d.end + 360) / 2;
                const starNum = state.calc.stars.year[k];
                let sCol = '#94a3b8'; let bgCol = 'rgba(148, 163, 184, 0.15)'; 
                if ([9, 1, 8].includes(starNum)) { sCol = '#4ade80'; bgCol = 'rgba(74, 222, 128, 0.15)'; } 
                if ([2, 7, 3].includes(starNum)) { sCol = '#f87171'; bgCol = 'rgba(248, 113, 113, 0.15)'; } 
                if (starNum === 5) { sCol = '#facc15'; bgCol = 'rgba(250, 204, 21, 0.15)'; } 
                
                drawSeg(rTai, rStar, d.start, d.end, bgCol, 'transparent'); 
                const starRad = rTai + (rStar - rTai) * 0.5;
                ctx.save(); 
                ctx.rotate((mid - 90) * Math.PI / 180); 
                ctx.translate(starRad, 0); 
                ctx.rotate(Math.PI / 2);
                ctx.beginPath(); 
                ctx.arc(0, 0, innerFontSize * 1.8, 0, 2*Math.PI); 
                ctx.strokeStyle = sCol; ctx.lineWidth = 3; ctx.fillStyle = '#0f172a'; ctx.fill(); ctx.stroke();
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = sCol; 
                ctx.font = `900 ${innerFontSize * 2.2}px Arial`; 
                ctx.fillText(starNum, 0, 0); 
                ctx.restore();
            });
        }

        if (vm === 'TIME') {
            activeSanShas.forEach(aff => {
                ctx.beginPath(); 
                const ssSRad = (aff.ssStart - 90) * Math.PI / 180; 
                let ssERad = (aff.ssEnd - 90) * Math.PI / 180;
                if (ssERad < ssSRad) ssERad += 2 * Math.PI; 
                ctx.arc(0, 0, rTicks - 6, ssSRad, ssERad); 
                ctx.strokeStyle = '#f97316'; ctx.lineWidth = 12; ctx.stroke();
            });
        }
    }
    
    ctx.beginPath(); ctx.arc(0, 0, rTai, 0, 2*Math.PI); ctx.fillStyle = baseBgColor; ctx.fill(); 
    const tj = rTai * 0.8;
    ctx.beginPath(); ctx.arc(0, 0, tj, Math.PI/2, Math.PI*1.5); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, tj, Math.PI*1.5, Math.PI/2); ctx.fillStyle = '#000000'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -tj/2, tj/2, 0, 2*Math.PI); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, tj/2, tj/2, 0, 2*Math.PI); ctx.fillStyle = '#000000'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -tj/2, tj/6, 0, 2*Math.PI); ctx.fillStyle = '#000000'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, tj/2, tj/6, 0, 2*Math.PI); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.restore();

    texture.needsUpdate = true;
    pulseTexture.needsUpdate = true;
    pulseMesh.visible = hasPulse;
}
