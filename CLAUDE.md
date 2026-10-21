# LuopanV2 — คำแนะนำสำหรับ Claude

แอปเข็มทิศหล่อแก (Luopan 3D Pro) เว็บล้วน ไม่มีขั้นตอน build เผยแพร่ด้วย GitHub Pages จาก branch `main`
ลิงก์ใช้งาน: https://stdsk99.github.io/LuopanV2/

## แหล่งอ้างอิง (ตามที่เจ้าของกำหนด)
- `stdsk99/luopan-app` ใช้**อ่านอ้างอิงเท่านั้น** ห้ามแก้
- อ้างอิงคู่กับไฟล์ APK ต้นแบบ `Thai_F12_LuoPan_release.apk` (FengShui100 / อ.มาศ) เสมอ
- สูตรดาวเหินใน `js/flyingstar.js` ตรวจกับตาราง `StarTab` ของ APK แล้ว ตรงครบ 216/216

## โครงสร้าง (โหลดตามลำดับใน index.html)
`js/version-check.js` → `data.js` → `calc.js` → `ui.js` → `luopan3d.js` → `compass.js` → `flyingstar.js` → `person.js` → `main.js`
เป็นสคริปต์ธรรมดา (ไม่ใช่ module) ใช้ตัวแปรร่วมกัน: โค้ดที่รันทันทีต้องอ้างถึงสิ่งที่ประกาศในไฟล์ก่อนหน้าเท่านั้น

## ทุกครั้งที่แก้ไข
1. ทำใน branch ใหม่ แล้วเปิด Pull Request ให้เจ้าของ merge เอง
2. **เพิ่มเลขเวอร์ชัน** ให้ตรงกันใน `version.json`, `window.APP_VERSION` และ `?v=` ของทุกไฟล์ใน `index.html`
   (ไม่งั้นผู้ใช้จะเห็นของเก่าจาก cache นานถึง 10 นาที)
3. ข้อความในแอปและคอมเมนต์เป็นภาษาไทย
