// เริ่มทำงาน: วนวาดภาพ และคำนวณครั้งแรก
function animate() {
    requestAnimationFrame(animate);
    
    // ทิศชงกะพริบ: เปลี่ยนแค่ความโปร่งใสของชั้นไฮไลต์ ไม่ต้องวาด texture ใหม่
    // (จานหลักวาดใหม่เฉพาะตอนข้อมูลเปลี่ยน ผ่าน draw2DTexture())
    if (hasPulse) {
        pulseMaterial.opacity = isARTransparent ? 0.4 : 0.3 + Math.sin(Date.now() / 150) * 0.25;
    }
    
    if (luopanMesh && state.isCompassActive) { 
        displayDegree = lerpAngle(displayDegree, targetDegree, 0.15); 
        luopanMesh.rotation.z = displayDegree * (Math.PI / 180); 
        if(Math.abs(state.currentDegree - displayDegree) > 0.5) { 
            updateAdviceBox(displayDegree); 
            state.currentDegree = displayDegree; 
        } 
    }
    renderer.render(scene, camera);
}

calculateAll(); 
animate();
