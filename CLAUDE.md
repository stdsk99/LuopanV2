# LuopanV2 — คำแนะนำสำหรับ Claude

แอปเข็มทิศหล่อแก (Luopan 3D Pro) เว็บล้วน ไม่มีขั้นตอน build เผยแพร่ด้วย GitHub Pages จาก branch `main`
ลิงก์ใช้งาน: https://stdsk99.github.io/LuopanV2/

## แหล่งอ้างอิง (ตามที่เจ้าของกำหนด)
- `stdsk99/luopan-app` ใช้**อ่านอ้างอิงเท่านั้น** ห้ามแก้
- อ้างอิงคู่กับไฟล์ APK ต้นแบบ `Thai_F12_LuoPan_release.apk` (FengShui100 / อ.มาศ) เสมอ
- สูตรดาวเหินใน `js/fs-core.js` ตรวจกับตาราง `StarTab` ของ APK แล้ว ตรงครบ 216/216
- **อ่านบันทึกสูตร `REFERENCE.md` ก่อนเริ่มงาน**: อยู่ใน repo ส่วนตัว `stdsk99/luopan-notes` (ไม่อยู่ใน repo สาธารณะนี้) · อัปเดตไฟล์นั้นเมื่อพบความรู้ใหม่ และห้ามนำกลับเข้า repo นี้

## โครงสร้าง (โหลดตามลำดับ)
- `home.html` (บ้านของฉัน โหมดผู้ใช้ทั่วไป): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `fs-core.js` → `fs-pairs.js` → `person-core.js` → `remedy-core.js` → `remedy-ui.js` → `simple-core.js` → `home.js`
- `compass.html` (หล่อแกแบบง่าย 2 มิติ โหมดทั่วไป): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `magdec.js` → `fs-core.js` → `fs-pairs.js` → `person-core.js` → `remedy-core.js` → `simple-core.js` → `simple-compass.js`
- `houses.html` (บ้านและลูกค้า เฉพาะโหมดมืออาชีพ): `js/version-check.js` → `mode.js` → `houses.js` → `fs-core.js` → `houses-ui.js`
- `report.html` (รายงาน PDF ของบ้านที่เปิดอยู่ พิมพ์ด้วย window.print): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `fs-core.js` → `fs-pairs.js` → `person-core.js` → `remedy-core.js` → `simple-core.js` → `report.js` · ข้อมูลผู้ดูใน `luopan_consultant`
- `furniture.html` (ตรวจทิศเฟอร์นิเจอร์ ทั้งสองโหมด): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `magdec.js` → `fs-core.js` → `fs-pairs.js` → `person-core.js` → `remedy-core.js` → `simple-core.js` → `furniture-core.js` → `furniture.js` · ข้อมูลต่อบ้านใน `luopan_furniture` (สมาชิก + ของแต่ละชิ้น)
- `water.html` (จุดวางน้ำ/ประตู + ประตูเมือง ทั้งสองโหมด): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `magdec.js` → `fs-core.js` → `remedy-core.js` → `remedy-ui.js` → `heading.js` → `water-core.js` → `water.js` · `houseGates` (城門訣) อยู่ใน fs-core · `heading.js` = อ่านเซนเซอร์เข็มทิศใช้ร่วม
- `room.html` (ผังรายห้อง 小太極 ทั้งสองโหมด): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `magdec.js` → `fs-core.js` → `fs-pairs.js` → `person-core.js` → `remedy-core.js` → `remedy-ui.js` → `simple-core.js` → `furniture-core.js` → `heading.js` → `room-core.js` → `room.js` · ห้องเก็บใน `luopan_furniture.rooms`
- `today.html` (ทิศมงคลรายวัน ทั้งสองโหมด): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `magdec.js` → `person-core.js` → `heading.js` → `today.js` · ทิศเทพ/ยามมงคล/宜忌 จาก Lunar.js
- `remedies.html` (คลังวิธีแก้): `js/version-check.js` → `mode.js` → `remedy-core.js` → `remedy-ui.js` (สคริปต์ในหน้า)
- `index.html` (เข็มทิศ): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `ui.js` → `luopan3d.js` → `magdec.js` → `compass.js` → `fs-core.js` → `fs-pairs.js` → `flyingstar.js` → `person-core.js` → `person.js` → `north-ui.js` → `main.js`
- `plan.html` (วิเคราะห์บ้านบนแปลน ตาราง 9 ช่อง): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `fs-core.js` → `fs-pairs.js` → `person-core.js` → `plan.js`
- `annual.html` (ผังพลังประจำปี): `js/version-check.js` → `mode.js` → `houses.js` → `data.js` → `calc.js` → `fs-core.js` → `remedy-core.js` → `remedy-ui.js` → `annual.js`
- `measure.html` (วัดทิศบ้านจากแผนที่, Leaflet): `js/version-check.js` → `mode.js` → `houses.js` → `magdec.js` → `fs-core.js` → `measure.js`
- `sun.html` (วัดทิศจากเงาแดด): `js/version-check.js` → `mode.js` → `houses.js` → `magdec.js` → `fs-core.js` → `sunpos.js` → `sun.js`
- **หลายบ้าน** (`houses.js` โหลดต่อจาก `mode.js` ในทุกหน้า ยกเว้น remedies): รายการใน `luopan_houses` · คีย์เดิม (`luopan_house`, `luopan_plan`, `luopan_birthDate`, `luopan_gender`, `luopan_furniture`) = บ้านที่เปิดอยู่เสมอ หน้าอื่นไม่ต้องรู้เรื่องหลายบ้าน · โหมดทั่วไปเปิด `mine` เสมอ โหมดมืออาชีพเปิด `cur` · ข้อมูลของบ้านที่เปิดอยู่ไม่เก็บซ้ำในรายการ · `data-house-name` แสดงชื่อบ้าน · `data-pro-only` ซ่อนในโหมดทั่วไป
- **สองโหมด** (`mode.js` โหลดในทุกหน้า): ทั่วไป = เริ่มที่ `home.html` (index เด้งไป home ยกเว้น `?full=1`), มืออาชีพ = เริ่มที่ `index.html` · เปิดครั้งแรกเป็นโหมดทั่วไป · `?mode=simple|pro` · ปุ่มย้อนกลับ `a[data-back]` ไป home ในโหมดทั่วไป
- `simple-core.js` = สรุปภาษาง่าย + ดาว 1–5 (เกณฑ์แอปกำหนดเอง) · `remedy-core.js` = คลังของเสริม/ของแก้ + ภาพวาด SVG (`REMEDY_LIB`, `REMEDY`) · `remedy-ui.js` = การ์ดรายละเอียด (แตะอะไรก็ได้ที่มี `data-remedy`)
- `magdec.js` = มุมเบี่ยงแม่เหล็ก WMM-2025 + ทิศอ้างอิงที่ผู้ใช้เลือก (`luopan_north`: แม่เหล็ก/ทิศเหนือจริง)
- `fs-core.js` / `person-core.js` = สูตรล้วน (ดาวเหิน, 八宅, Kua) ใช้ร่วมกันทั้งสองหน้า ห้ามอ้างถึง `state` หรือ DOM ของหน้าเข็มทิศ
- ข้อมูลร่วมใน localStorage: `luopan_house`, `luopan_birthDate`, `luopan_gender`; แปลนอยู่ใน `luopan_plan` · ตัวเลือกผังทดแทน `luopan_tigua` · โหมด `luopan_mode` (simple/pro)
เป็นสคริปต์ธรรมดา (ไม่ใช่ module) ใช้ตัวแปรร่วมกัน: โค้ดที่รันทันทีต้องอ้างถึงสิ่งที่ประกาศในไฟล์ก่อนหน้าเท่านั้น

## ทุกครั้งที่แก้ไข
1. ทำใน branch ใหม่ เปิด Pull Request แล้ว **merge เองได้เลยหลังทดสอบผ่าน** (เจ้าของอนุญาตแล้ว) จากนั้นรอ GitHub Pages สร้างเว็บเสร็จ และแจ้งเจ้าของ
2. **เพิ่มเลขเวอร์ชัน** ให้ตรงกันใน `version.json`, `window.APP_VERSION` และ `?v=` ของทุกไฟล์ใน `index.html`, `plan.html`, `annual.html`, `measure.html`, `sun.html`, `home.html`, `compass.html`, `remedies.html`, `houses.html`, `report.html`, `furniture.html`, `water.html`, `room.html` และ `today.html`
   (ไม่งั้นผู้ใช้จะเห็นของเก่าจาก cache นานถึง 10 นาที)
3. ข้อความในแอปและคอมเมนต์เป็นภาษาไทย
