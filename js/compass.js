// เข็มทิศ (เซนเซอร์ทุกช่องทาง) แถบเลื่อนปรับองศา และกล้อง AR
let targetDegree = 0; let displayDegree = 0;
const norm360 = (d) => ((d % 360) + 360) % 360;
// ขยับมุมเข้าหาเป้าทางสั้นที่สุด (ข้าม 0°/360° ได้ไม่กระโดด)
function lerpAngle(start, end, amount) {
    const diff = ((end - start + 540) % 360) - 180;
    return norm360(start + diff * amount);
}
function screenAngle() {
    if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle;
    return typeof window.orientation === 'number' ? window.orientation : 0;
}

// รับค่าเข็มทิศ:
// - iPhone: ใช้ webkitCompassHeading (อิงทิศเหนือ)
// - Android: ใช้ deviceorientationabsolute เท่านั้น อีเวนต์ deviceorientation ปกติให้ alpha แบบสัมพัทธ์ (ไม่อิงทิศเหนือ)
//   ถ้าเอามาปนกัน ค่าจะสลับไปมาและหน้าปัดกระโดด
// ถ้าเครื่องส่งมาแค่ค่าแบบสัมพัทธ์ (ไม่มีเซนเซอร์แม่เหล็ก หรือเบราว์เซอร์ไม่รองรับ)
// จะเข้า "โหมดหมุนตามเครื่อง": เริ่มจากองศาที่ตั้งไว้ด้วยแถบเลื่อน แล้วหมุนตามการหมุนของเครื่อง
let gotAbsoluteEvent = false; let lastHeadingAt = 0;
let lastRelativeAlpha = null; let relativeMode = false; let relativeOffset = 0;
function handleOrientation(event) {
    if (!state.isCompassActive) return;
    let heading = null;
    if (typeof event.webkitCompassHeading === 'number' && !isNaN(event.webkitCompassHeading)) {
        heading = event.webkitCompassHeading;
    } else if (event.type === 'deviceorientationabsolute') {
        if (event.alpha === null || event.alpha === undefined) return; // เซนเซอร์ยังไม่พร้อม
        gotAbsoluteEvent = true;
        heading = 360 - event.alpha;
    } else if (event.absolute === true && !gotAbsoluteEvent && event.alpha !== null) {
        heading = 360 - event.alpha; // เบราว์เซอร์ที่ส่ง absolute มากับ deviceorientation
    } else if (event.alpha !== null && event.alpha !== undefined) {
        lastRelativeAlpha = event.alpha;
        if (relativeMode && !gotAbsoluteEvent) targetDegree = norm360(360 - event.alpha + relativeOffset);
        return;
    }
    if (heading === null || isNaN(heading)) return;
    relativeMode = false;
    // บวกมุมเบี่ยงแม่เหล็กเมื่อผู้ใช้เลือกทิศเหนือจริง (js/magdec.js)
    targetDegree = norm360(heading + screenAngle() + northOffset());
    lastHeadingAt = Date.now();
}

els.compassBtn.addEventListener('click', async () => {
    if (!state.isCompassActive) {
        // เซนเซอร์ใช้ได้เฉพาะหน้าเว็บที่ปลอดภัย (https://) ไฟล์ที่เปิดจากแอปจัดการไฟล์บนมือถือจะไม่ได้รับค่า
        if (window.isSecureContext === false) {
            showToast("เข็มทิศใช้ได้เฉพาะเว็บที่เปิดผ่าน https://\nไฟล์ที่เปิดจากในเครื่องใช้เซนเซอร์ไม่ได้");
            return;
        }
        if (typeof DeviceOrientationEvent === 'undefined') {
            showToast("เบราว์เซอร์นี้ไม่รองรับเข็มทิศ ใช้แถบเลื่อนแทน");
            return;
        }
        gotAbsoluteEvent = false; lastRelativeAlpha = null; relativeMode = false;
        // ขอสิทธิ์ก่อนถ้าเบราว์เซอร์มีฟังก์ชันนี้ (iPhone และ Chrome รุ่นใหม่ก็มี)
        // แล้วฟังทุกช่องทางเสมอ ไม่ต้องเดาว่าเป็นเครื่องอะไร
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') { showToast("ต้องอนุญาตให้เข้าถึงเข็มทิศก่อนครับ"); return; }
            } catch (e) { /* บางเบราว์เซอร์ไม่ต้องขอสิทธิ์ ให้ลองฟังต่อไป */ }
        }
        window.addEventListener('deviceorientationabsolute', handleOrientation);
        window.addEventListener('deviceorientation', handleOrientation);
        startAbsoluteSensor();
        startCompass();
    } else { stopCompass(); }
});

// ช่องทางสำรองบน Android: Generic Sensor API (AbsoluteOrientationSensor)
// บางเครื่อง Chrome ไม่ส่งอีเวนต์ deviceorientationabsolute ทั้งที่มีเซนเซอร์แม่เหล็ก
// แต่ยังอ่านทิศจริงผ่าน AbsoluteOrientationSensor ได้
let absSensor = null;
async function startAbsoluteSensor() {
    if (!('AbsoluteOrientationSensor' in window)) return;
    try {
        if (navigator.permissions && navigator.permissions.query) {
            const names = ['accelerometer', 'gyroscope', 'magnetometer'];
            const results = await Promise.all(names.map(n => navigator.permissions.query({ name: n }).catch(() => null)));
            if (results.some(r => r && r.state === 'denied')) return;
        }
        absSensor = new AbsoluteOrientationSensor({ frequency: 30, referenceFrame: 'device' });
        absSensor.addEventListener('reading', () => {
            if (!state.isCompassActive || gotAbsoluteEvent || !absSensor.quaternion) return;
            // quaternion หมุนพิกัดเครื่อง -> พิกัดโลก (x=ตะวันออก, y=เหนือ, z=ขึ้น)
            // ทิศที่หัวเครื่องชี้ = แกน y ของเครื่องเมื่อแปลงเป็นพิกัดโลก
            const [x, y, z, w] = absSensor.quaternion;
            const east = 2 * (x * y - z * w);
            const north = 1 - 2 * (x * x + z * z);
            if (Math.hypot(east, north) < 0.2) return; // ถือเครื่องตั้งตรงเกินไป
            relativeMode = false;
            targetDegree = norm360(Math.atan2(east, north) * 180 / Math.PI + screenAngle() + northOffset());
            lastHeadingAt = Date.now();
        });
        absSensor.addEventListener('error', () => { absSensor = null; });
        absSensor.start();
    } catch (e) { absSensor = null; }
}
function stopAbsoluteSensor() {
    if (absSensor) { try { absSensor.stop(); } catch (e) {} absSensor = null; }
}

function startCompass() { 
    state.isCompassActive = true; 
    els.compassBtn.classList.replace('bg-indigo-600/95', 'bg-red-600/95'); 
    els.compassBtn.innerHTML = '<svg class="w-full h-full animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>'; 
    els.manualRotationControl.classList.add('hidden');
    showToast("เริ่มจับเข็มทิศแล้ว");
    const startedAt = Date.now();
    setTimeout(() => {
        if (!state.isCompassActive || lastHeadingAt >= startedAt) return; // ได้ค่าทิศเหนือแล้ว ปกติ
        if (lastRelativeAlpha !== null) {
            // ได้ค่าแต่ไม่อิงทิศเหนือ: หมุนตามเครื่องโดยเริ่มจากองศาเดิม
            relativeMode = true;
            relativeOffset = norm360(displayDegree - (360 - lastRelativeAlpha));
            showToast("เครื่องนี้ไม่ส่งค่าทิศเหนือ\nจานจะหมุนตามเครื่อง โดยเริ่มจาก " + displayDegree.toFixed(1) + "°\n(ตั้งองศาด้วยแถบเลื่อนก่อนเปิดเข็มทิศ)");
        } else {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            showToast(isMobile
                ? "ไม่ได้รับค่าจากเซนเซอร์\nเปิดสิทธิ์ 'เซ็นเซอร์ตรวจจับการเคลื่อนไหว' ในการตั้งค่าเว็บไซต์ของ Chrome"
                : "คอมพิวเตอร์ไม่มีเซนเซอร์เข็มทิศ ใช้แถบเลื่อนแทน");
            stopCompass();
        }
    }, 3000);
}

function stopCompass() { 
    state.isCompassActive = false; 
    window.removeEventListener('deviceorientation', handleOrientation); 
    window.removeEventListener('deviceorientationabsolute', handleOrientation); 
    stopAbsoluteSensor();
    els.compassBtn.classList.replace('bg-red-600/95', 'bg-indigo-600/95'); 
    els.compassBtn.innerHTML = '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>'; 
    els.manualRotationControl.classList.remove('hidden'); 
    els.manualDegree.value = displayDegree; 
}

els.manualDegree.addEventListener('input', (e) => { 
    targetDegree = parseFloat(e.target.value); 
    displayDegree = targetDegree; 
    if(luopanMesh) luopanMesh.rotation.z = displayDegree * (Math.PI / 180); 
    updateAdviceBox(displayDegree); 
    state.currentDegree = displayDegree; 
});

const video = document.getElementById('videoBackground');
els.arBtn.addEventListener('click', async () => {
    if (!isARTransparent) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); 
            video.srcObject = stream; video.style.display = 'block'; isARTransparent = true;
            els.arBtn.classList.replace('bg-slate-800/95', 'bg-emerald-600/95'); 
            els.arBtn.classList.replace('text-emerald-400', 'text-white'); 
            document.body.style.backgroundColor = 'transparent';
            showToast("เปิดโหมดซ้อนทับภาพ (AR) แล้ว");
            updateStatusBadge();
        } catch(err) { showToast("ไม่สามารถเปิดกล้องได้: " + err.message); }
    } else {
        const stream = video.srcObject; 
        if (stream) stream.getTracks().forEach(track => track.stop()); 
        video.style.display = 'none'; isARTransparent = false;
        els.arBtn.classList.replace('bg-emerald-600/95', 'bg-slate-800/95'); 
        els.arBtn.classList.replace('text-white', 'text-emerald-400'); 
        document.body.style.backgroundColor = '#020617';
        updateStatusBadge();
    }
    draw2DTexture();
});
