# LuopanV2 — คำแนะนำสำหรับ Claude

แอปเข็มทิศหล่อแก (Luopan 3D Pro) เว็บล้วน ไม่มีขั้นตอน build เผยแพร่ด้วย GitHub Pages จาก branch `main`
ลิงก์ใช้งาน: https://stdsk99.github.io/LuopanV2/

## แหล่งอ้างอิง (ตามที่เจ้าของกำหนด)
- `stdsk99/luopan-app` ใช้**อ่านอ้างอิงเท่านั้น** ห้ามแก้
- อ้างอิงคู่กับไฟล์ APK ต้นแบบ `Thai_F12_LuoPan_release.apk` (FengShui100 / อ.มาศ) เสมอ
- สูตรดาวเหินใน `js/fs-core.js` ตรวจกับตาราง `StarTab` ของ APK แล้ว ตรงครบ 216/216
- **อ่าน `docs/REFERENCE.md` ก่อนเริ่มงาน**: สรุปสูตรและองค์ความรู้จาก APK, สิ่งที่แอปกำหนดเอง และงานค้าง (อัปเดตไฟล์นี้เมื่อพบความรู้ใหม่)

## โครงสร้าง (โหลดตามลำดับ)
- `index.html` (เข็มทิศ): `js/version-check.js` → `data.js` → `calc.js` → `ui.js` → `luopan3d.js` → `compass.js` → `fs-core.js` → `flyingstar.js` → `person-core.js` → `person.js` → `main.js`
- `plan.html` (วิเคราะห์บ้านบนแปลน ตาราง 9 ช่อง): `js/version-check.js` → `data.js` → `calc.js` → `fs-core.js` → `person-core.js` → `plan.js`
- `fs-core.js` / `person-core.js` = สูตรล้วน (ดาวเหิน, 八宅, Kua) ใช้ร่วมกันทั้งสองหน้า ห้ามอ้างถึง `state` หรือ DOM ของหน้าเข็มทิศ
- ข้อมูลร่วมใน localStorage: `luopan_house`, `luopan_birthDate`, `luopan_gender`; แปลนอยู่ใน `luopan_plan`
เป็นสคริปต์ธรรมดา (ไม่ใช่ module) ใช้ตัวแปรร่วมกัน: โค้ดที่รันทันทีต้องอ้างถึงสิ่งที่ประกาศในไฟล์ก่อนหน้าเท่านั้น

## ทุกครั้งที่แก้ไข
1. ทำใน branch ใหม่ แล้วเปิด Pull Request ให้เจ้าของ merge เอง
2. **เพิ่มเลขเวอร์ชัน** ให้ตรงกันใน `version.json`, `window.APP_VERSION` และ `?v=` ของทุกไฟล์ใน `index.html` และ `plan.html`
   (ไม่งั้นผู้ใช้จะเห็นของเก่าจาก cache นานถึง 10 นาที)
3. ข้อความในแอปและคอมเมนต์เป็นภาษาไทย
