// วัดทิศหน้าบ้านจากแผนที่ (measure.html): แตะมุม 2 มุมของผนังหน้าบ้าน แล้วเลือกด้านนอกบ้าน
// แผนที่อิงทิศเหนือจริง → แปลงเป็นทิศอ้างอิงที่ผู้ใช้เลือก (js/magdec.js) แล้วบันทึกเป็น luopan_house
const $ = (id) => document.getElementById(id);
const rad = Math.PI / 180;
const norm = (d) => ((d % 360) + 360) % 360;
const fmt = (d) => ((Math.round(d * 10) / 10) % 360).toFixed(1); // 359.96 → 0.0
// มุมทิศ (bearing) จากจุด a ไป b ตามทิศเหนือจริง
function bearing(a, b) {
    const p1 = a.lat * rad, p2 = b.lat * rad, dl = (b.lng - a.lng) * rad;
    return norm(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / rad);
}

// ---------- แผนที่ ----------
let last = null;
try { last = JSON.parse(localStorage.getItem('luopan_map_view') || 'null'); } catch (e) {}
const map = L.map('map', { zoomControl: true, attributionControl: true }).setView(last ? [last.lat, last.lng] : [13.7563, 100.5018], last ? last.z : 6);
const layers = {
    sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 20, maxNativeZoom: 19, attribution: 'ภาพ © Esri, Maxar, Earthstar Geographics' }),
    line: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, maxNativeZoom: 19, attribution: '© ผู้ร่วมพัฒนา OpenStreetMap' })
};
let layerKey = 'sat';
try { layerKey = localStorage.getItem('luopan_map_layer') || 'sat'; } catch (e) {}
layers[layerKey].addTo(map);
function setLayer(k) {
    map.removeLayer(layers[layerKey]); layerKey = k; layers[k].addTo(map);
    try { localStorage.setItem('luopan_map_layer', k); } catch (e) {}
    document.querySelectorAll('#layerSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === k)));
}
setLayer(layerKey);
map.on('moveend', () => { const c = map.getCenter(); try { localStorage.setItem('luopan_map_view', JSON.stringify({ lat: c.lat, lng: c.lng, z: map.getZoom() })); } catch (e) {} });

// ---------- การวัด ----------
let measuring = false, pts = [], marks = [], wall = null, picks = [], chosen = null;
function hint(t, warn) { const h = $('hint'); h.textContent = t; h.className = 'text-[12px] rounded-lg px-3 py-2 mb-2 border ' + (warn ? 'text-amber-200 bg-amber-950/40 border-amber-800/60' : 'text-sky-200 bg-sky-950/40 border-sky-800/60'); }
function defaultHint() {
    if (measuring) hint(pts.length === 0 ? 'แตะมุมแรกของผนังด้านหน้าบ้าน' : 'แตะมุมที่สองของผนังด้านหน้าบ้าน');
    else if (pts.length === 2 && chosen === null) hint('แตะป้ายลูกศรด้านที่เป็น "นอกบ้าน"');
    else if (chosen !== null) hint('ได้ทิศหน้าบ้านแล้ว กดบันทึกด้านขวา (หรือด้านล่างบนมือถือ)');
    else hint(map.getZoom() < 17 ? 'ซูมเข้าไปจนเห็นตัวบ้านชัด แล้วกด "เริ่มวัดผนังหน้าบ้าน"' : 'กด "เริ่มวัดผนังหน้าบ้าน" แล้วแตะมุมทั้งสองของผนังหน้าบ้าน');
}
function clearAll() {
    marks.forEach(m => map.removeLayer(m)); picks.forEach(m => map.removeLayer(m));
    if (wall) map.removeLayer(wall);
    marks = []; picks = []; wall = null; pts = []; chosen = null; measuring = false;
    $('measureBtn').setAttribute('aria-pressed', 'false');
    renderResult(); defaultHint();
}
function startMeasure() { clearAll(); measuring = true; $('measureBtn').setAttribute('aria-pressed', 'true'); defaultHint(); }
map.on('click', (e) => {
    if (!measuring) return;
    pts.push(e.latlng);
    marks.push(L.marker(e.latlng, { icon: L.divIcon({ className: '', html: '<div class="pt-mark"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), draggable: true }).addTo(map));
    const mk = marks[marks.length - 1], idx = pts.length - 1;
    mk.on('drag', (ev) => { pts[idx] = ev.target.getLatLng(); if (pts.length === 2) drawWall(); });
    if (pts.length === 2) { measuring = false; $('measureBtn').setAttribute('aria-pressed', 'false'); drawWall(); }
    defaultHint();
});
map.on('zoomend', () => { if (pts.length === 2) drawWall(); defaultHint(); });
// เส้นผนัง + ป้ายลูกศรตั้งฉากสองด้าน ให้ผู้ใช้เลือกด้านนอกบ้าน
function drawWall() {
    if (wall) map.removeLayer(wall); picks.forEach(m => map.removeLayer(m)); picks = [];
    wall = L.polyline(pts, { color: '#facc15', weight: 5 }).addTo(map);
    const b = bearing(pts[0], pts[1]), opts = [norm(b - 90), norm(b + 90)];
    const p0 = map.latLngToContainerPoint(pts[0]), p1 = map.latLngToContainerPoint(pts[1]), mid = p0.add(p1).divideBy(2);
    opts.forEach((deg, i) => {
        const off = L.point( // แผนที่ทิศเหนืออยู่บนเสมอ
            Math.sin(deg * rad) * 55, -Math.cos(deg * rad) * 55);
        const ll = map.containerPointToLatLng(mid.add(off));
        const on = chosen === null ? true : chosen === i;
        const m = L.marker(ll, { icon: L.divIcon({ className: '', html: `<div class="arrow-pick ${i ? 'alt' : ''}" style="opacity:${on ? 1 : 0.35}">${['⬆', '↗', '➡', '↘', '⬇', '↙', '⬅', '↖'][Math.round(deg / 45) % 8]} หน้าบ้าน ${fmt(deg)}°</div>`, iconSize: [0, 0] }) }).addTo(map);
        m.on('click', () => { chosen = i; drawWall(); renderResult(); defaultHint(); });
        picks.push(m);
    });
    renderResult();
}

// ---------- ผลลัพธ์ ----------
function renderResult() {
    const box = $('result');
    if (pts.length < 2) { box.innerHTML = '<div class="text-slate-400">ยังไม่ได้วัด · แตะมุมทั้งสองของผนังหน้าบ้านบนแผนที่</div>'; return; }
    const b = bearing(pts[0], pts[1]), opts = [norm(b - 90), norm(b + 90)];
    const mid = L.latLng((pts[0].lat + pts[1].lat) / 2, (pts[0].lng + pts[1].lng) / 2);
    const len = pts[0].distanceTo(pts[1]);
    if (chosen === null) {
        box.innerHTML = `<div class="text-slate-300">ผนังยาว ${len.toFixed(1)} ม. · เลือกด้านนอกบ้าน:</div>
            <div class="flex flex-wrap gap-2 mt-2">${opts.map((d, i) => `<button type="button" class="tool pick" data-i="${i}">${i ? '🔵' : '🔴'} ${fmt(d)}°</button>`).join('')}</div>`;
        box.querySelectorAll('.pick').forEach(x => x.addEventListener('click', () => { chosen = +x.dataset.i; drawWall(); defaultHint(); }));
        return;
    }
    const tr = opts[chosen], dec = magDeclination(mid.lat, mid.lng, new Date());
    const ref = NORTH.mode === 'true' ? tr : norm(tr - dec);
    const mt = houseMountainOf(ref), sm = houseMountainOf(ref + 180), ln = houseDownLine(ref), f = houseMountainOf(ref);
    box.innerHTML = `
        <div class="text-[12px] text-slate-400">ทิศหน้าบ้าน (หัน)</div>
        <div class="text-3xl font-black text-yellow-400 font-mono">${fmt(ref)}°</div>
        <div class="text-[12px] text-slate-300">หัน <b class="cn text-yellow-300">${HOUSE_M24[mt.m]}</b> ${HOUSE_M24_TH[mt.m]} · นั่ง <b class="cn text-sky-300">${HOUSE_M24[sm.m]}</b> · ${HOUSE_PALACE_TH[mt.palace]}</div>
        <div class="text-[11px] text-slate-400 mt-1">ตามแผนที่ (ทิศเหนือจริง) ${fmt(tr)}° · มุมเบี่ยงแม่เหล็กที่บ้าน ${dec >= 0 ? '+' : ''}${dec.toFixed(2)}° · ใช้${NORTH.mode === 'true' ? 'ทิศเหนือจริง' : 'ทิศแม่เหล็ก'}ตามที่ตั้งไว้</div>
        ${ln ? `<div class="mt-2 text-[12px] text-amber-300">⚠️ ตก${ln.th} (${ln.cn}) ${ln.a}°–${ln.b}°: ${ln.t}</div>` : (f.dist <= 3 ? `<div class="mt-2 text-[12px] text-amber-300">⚠️ ห่างเส้นแบ่งภูเขา ${f.dist.toFixed(1)}° (ช่วง 兼)</div>` : '')}
        <div class="grid grid-cols-2 gap-2 mt-3">
            <label class="text-[11px] text-slate-400">ปีที่สร้าง/รีโนเวท<input id="yIn" type="number" min="1864" max="2163" value="${house ? house.year : new Date().getFullYear()}" class="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"></label>
            <div class="flex items-end"><button type="button" id="saveBtn" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-[13px] font-semibold">💾 บันทึกเป็นทิศหน้าบ้าน</button></div>
        </div>
        <div id="saved" class="mt-2 text-[12px]"></div>`;
    $('saveBtn').addEventListener('click', () => {
        const y = parseInt($('yIn').value, 10);
        house = { facing: (Math.round(ref * 10) / 10) % 360, year: (y >= 1864 && y <= 2163) ? y : new Date().getFullYear(), period: house ? house.period : 'auto', savedAt: Date.now(), source: 'map' };
        houseSave();
        // ใช้ตำแหน่งบ้านคำนวณมุมเบี่ยงในหน้าเข็มทิศด้วย
        NORTH.lat = mid.lat; NORTH.lng = mid.lng; NORTH.place = 'ตำแหน่งบ้านจากแผนที่'; northSave();
        $('saved').innerHTML = `<span class="text-emerald-300">✔ บันทึกทิศหน้าบ้าน ${house.facing.toFixed(1)}° แล้ว</span> · <a href="plan.html" class="text-sky-300 underline">วิเคราะห์บ้าน</a> · <a href="index.html" class="text-sky-300 underline">เข็มทิศ</a>`;
    });
}

// ---------- ค้นหาตำแหน่ง ----------
// รับพิกัด "lat, lng" หรือลิงก์ Google Maps แบบเต็ม (@lat,lng / q=lat,lng / !3dlat!4dlng)
function parseLoc(s) {
    s = (s || '').trim();
    let m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/) || s.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) || s.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) || s.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (!m) return null;
    const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}
function go() {
    const v = $('q').value, p = parseLoc(v);
    if (p) { map.setView([p.lat, p.lng], 19); clearAll(); return; }
    hint(/goo\.gl|maps\.app/.test(v) ? 'ลิงก์ย่อของ Google Maps เปิดในแอปนี้ไม่ได้ ให้เปิดลิงก์ แตะค้างที่บ้านแล้วคัดลอกพิกัดมาวาง' : 'อ่านพิกัดไม่ได้ ใส่แบบ 13.7563, 100.5018 หรือวางลิงก์ Google Maps แบบเต็ม', true);
}
$('goBtn').addEventListener('click', go);
$('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
$('hereBtn').addEventListener('click', () => {
    if (!navigator.geolocation) { hint('เบราว์เซอร์นี้หาตำแหน่งไม่ได้', true); return; }
    hint('กำลังหาตำแหน่ง…');
    navigator.geolocation.getCurrentPosition((p) => { map.setView([p.coords.latitude, p.coords.longitude], 19); defaultHint(); },
        (e) => hint(e.code === 1 ? 'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง' : 'หาตำแหน่งไม่สำเร็จ', true), { enableHighAccuracy: true, timeout: 15000 });
});
$('layerSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setLayer(b.dataset.v); });
$('measureBtn').addEventListener('click', startMeasure);
$('clearBtn').addEventListener('click', clearAll);
renderResult(); defaultHint();
