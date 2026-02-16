**<h1>Software Requirement Specification (SRS)</h1>**
**<h3>Mall Map & Store Management System</h3>**
<h2>1. บทนำ</h2>

 *<h4>&nbsp;&nbsp; &nbsp;  1.1 วัตถุประสงค์</h4>*
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  ระบบที่สร้างขึ้นนี้เป็น Web Application สำหรับแสดงแผนผังห้างสรรพสินค้าในรูปแบบ Interactive โดยผู้ใช้สามารถเลือก (Click) ร้านค้าบนแผนผังเพื่อดูรายละเอียดของร้านและสินค้าได้ นอกจากนี้ ระบบยังมีส่วนจัดการข้อมูลร้านค้าและสินค้า สำหรับผู้ดูแลระบบ (Admin) โดยกำหนดสิทธิ์การเข้าถึงตาม Role ของผู้ใช้งานแต่ละประเภท
      
   **&nbsp;&nbsp;&nbsp;&nbsp;โดยมีวัตถุประสงค์หลักดังต่อไปนี้** <br>
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. เพื่ออำนวยความสะดวกให้ผู้ใช้สามารถค้นหาและดูรายละเอียดร้านค้าและสินค้าได้อย่างรวดเร็ว <br>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. เพื่อแสดงแผนผังร้านค่าภายในห้างสรรพสินค้าในรูปแบบที่เข้าใจง่าย และสามารถโต้ตอบ (Interactive) ได้ <br>
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. เพื่อสนับสนุนการจัดการข้อมูลร้านค้าและสินค้าอย่างเป็นระบบผ่านหน้าจอผู้ดูแลระบบ <br>
        
*<h4>&nbsp;&nbsp; &nbsp; 1.2 ขอบเขตของระบบ</h4>* 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. ระบบสามารถแสดงแผนผังห้างแบบกดเลือกได้ <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. ระบบสามารถแสดงรายละเอียดของร้านค้าได้ เช่น ชื่อร้าน คำอธิบาย และข้อมูลที่เกี่ยวข้อง <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. ระบบสามารถแสดงรายการสินค้าภายในร้านค้า พร้อมข้อมูลรายละเอียดของสินค้า <br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4. ระบบรองรับการจัดการข้อมูลร้านค้าและสินค้า (Create, Read, Update, Delete: CRUD) สำหรับผู้ใช้งานที่ได้รับสิทธิ์ <br>
ทั้งนี้ ระบบครอบคลุมเฉพาะการแสดงผลข้อมูลร้านค้าและสินค้า และการจัดการข้อมูลภายในระบบ ไม่ครอบคลุมระบบชำระเงินออนไลน์หรือระบบจองสินค้า<br>

*<h4>&nbsp;&nbsp; &nbsp;1.3 คำจำกัดความ</h4>* 
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp; -  Interactive : การโต้ตอบระหว่างผู้ใช้กับระบบ เช่น การคลิกเลือกตำแหน่งร้านค้า<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp; -  Role : สิทธิ์ของผู้ใช้ในระบบ<br>
<h2>2. ภาพรวมของระบบำ</h2>

*<h4>&nbsp;&nbsp; &nbsp;  2.1 ลักษณะทั่วไปของระบบ</h4>*
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  ระบบเป็น Web Application ที่พัฒนาขึ้นเพื่อให้ผู้ใช้สามารถเข้าถึงข้อมูลร้านค้าและรายละเอียดสินค้าได้ผ่านเว็บเบราว์เซอร์ โดยมีการแสดงผลแผนผังห้างสรรพสินค้าในรูปแบบ Interactive ซึ่งผู้ใช้สามารถคลิกเลือกแต่ละร้านเพื่อดูข้อมูลเพิ่มเติมได้

โครงสร้างของระบบประกอบด้วย 3 ส่วนหลัก ดังนี้<br>
      - Frontend: ทำหน้าที่แสดงผลแผนผังห้าง ข้อมูลร้านค้า และรายละเอียดสินค้า รวมถึงรองรับการโต้ตอบกับผู้ใช้งาน<br>
      - Backend:  ทำหน้าที่ประมวลผล จัดการข้อมูล และควบคุมสิทธิ์การเข้าถึงของผู้ใช้แต่ละประเภท<br>
      - Database: ทำหน้าที่จัดเก็บข้อมูลผู้ใช้งาน ร้านค้า และสินค้า เพื่อให้ระบบสามารถเรียกใช้งานข้อมูลได้อย่างมีประสิทธิภาพ<br>

*<h4>&nbsp;&nbsp; &nbsp;  2.2 ฟังก์ชันการทำงานของระบบ (Product Functions)</h4>*
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;2.2.1 ระบบจัดการข้อมูลร้านค้าและสินค้า (เพิ่ม แก้ไข ลบ แสดงข้อมูล)<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;2.2.2 ระบบแสดงแผนผังห้างสรรพสินค้าในรูปแบบ Interactive<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;2.2.3 ระบบกำหนดสิทธิ์การใช้งานตามบทบาท (Role-Based Access Control)<br>

*<h4>&nbsp;&nbsp; &nbsp;  2.3 ลักษณะผู้ใช้งาน (User Characteristics)</h4>*
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;ระบบแบ่งผู้ใช้งานออกเป็น 2 ประเภทหลัก ได้แก่ <br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.3.1. ผู้ใช้ทั่วไป (User)<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- สามารถดูแผนผังห้างและรายละเอียดร้านค้า รวมถึงสินค้าได้<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- ไม่สามารถแก้ไขข้อมูลในระบบได้<br>

&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;2.3.2 ผู้ดูแลระบบ (Admin)<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- สามารถเพิ่ม แก้ไข และลบข้อมูลร้านค้าและสินค้า<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- มีสิทธิ์เข้าถึงเมนูจัดการระบบ<br>


*<h4>&nbsp;&nbsp; &nbsp;2.4 สภาพแวดล้อมในการทำงาน</h4>* 
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;- ระบบทำงานผ่าน Web Browser<br>

*<h4>&nbsp;&nbsp; &nbsp;2.5 ข้อจำกัดของระบบ</h4>* 
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;- ระบบต้องทำงานผ่านอินเทอร์เน็ต<br>
&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;- ระบบต้องทำงานผ่านเว็บเบราว์เซอร์เท่านั้น<br>



