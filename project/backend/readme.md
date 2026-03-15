ตอนนี้สามารถลองเพิ่มข้อมูลจากนอกวง LAN เข้า Database ได้โดยใช้ Ngrok เป็นตัวเปิด Public IP
ตอนเทสเพิ่มข้อมูลเข้าใช้ Extension Thunder จาก VS code ปรับเป็น POST ตามด้วย URL ที่เปิด Public จาก Ngrok/store สามารถเช็คข้อมูลถูกเพิ่มได้ไหมผ่าน browser ได้เลยโดย link-Ngrok/stores โดยตอนนี้รูปแบบคำสั่งเพิ่มข้อมูลยังต้องเขียนใน BODY รูปแบบ Json เช่น 

{
  "UserID":2,
 "StoreName": "Doll Shop",
"StoreCategoryID":3,
 "Phone": "0812345678",
 "LogoURL": "",
 "FloorID":1,
 "PosX":10.1,
 "PosY":11.1
}

การใช้ Ngrok คือ โหลดมาก่อนและสมัครใช้งานด้วย จากนั้นเปิดตัว EXE และเข้าตามโฟลเดอร์ที่ติดตั้ง จากนั้นใส่ authtoken  โดยใช้คำสั่ง config add-authtoken (ตามด้วยรหัสที่ได้มาจากการสมัคร) จากนั้นไปที่
 D:\project-AppDev\project\backend> python app.py(เข้าไปถึงโฟลเดอร์ backend) เพื่อเปิด server จากนั้น เปิด cmd อีกอัน จากนั้นพิมพ์ ngrok http 5000 จะได้ public server ในรูปแบบคล้าย 
 https://elementarily-oneirocritical-luther.ngrok-free.dev/

 ตอนนี้ Database สามารถเพิ่มได้แค่เฉพาะตอนเปิด Server เท่านั้น และไม่สามารถเปลี่ยน URL เองได้
 ไว้จะลองเพิ่ม Database เข้าไปใน Cloud เพื่อที่จะสามารถรันเซิฟเวอร์ขณะปิดเครื่องได้ แต่ Backend กับ Database ต้องอยู่ที่ Cloud ด้วย (ต้องทำขนาดนั้นบ่ครับ)
 - หมูปิ้งอีสาน