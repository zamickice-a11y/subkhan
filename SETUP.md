# SOUTHERN DRIVE MOTORS — ระบบสำนักงาน (คู่มือติดตั้ง)

ระบบออกใบ Invoice / Quote + บันทึกเงินเข้า-ออก + ค้นหาลูกค้า ทำให้อาจารย์ใช้ได้สะดวก ไม่ต้องเปิด Word ทำเอกสารเองทุกครั้ง

ใช้ฟรี (Supabase free tier + GitHub Pages) — ไม่ต้องจ่ายอะไร เริ่มต้น

## ติดตั้งครั้งแรก (ทำ 1 ครั้ง)

### 1. สร้าง Supabase project แยกสำหรับอาจารย์
1. เข้า https://supabase.com → Sign in (Google ก็ได้)
2. New Project → ตั้งชื่อ "southern-drive-office" → Region: **Sydney (ap-southeast-2)**
3. ตั้ง Database password — เก็บไว้ให้ดี
4. รอ 1-2 นาที project พร้อม

### 2. รัน schema
1. Sidebar → **SQL Editor** → New query
2. เปิด `schema.sql` → copy ทั้งไฟล์ → paste
3. กด **Run** (มุมขวาล่าง)
4. ต้องขึ้น "Success. No rows returned" ถ้าขึ้น error ส่งให้ผมดู

### 3. ปิดการสมัครสาธารณะ (สำคัญที่สุด!)
1. Sidebar → **Authentication** → **Sign In / Providers** → **Email**
2. หา toggle **"Allow new users to sign up"** → **ปิด (Disabled)** → Save
3. คนนอกจะสมัครเข้าระบบไม่ได้

### 4. สร้าง user ให้อาจารย์
1. Authentication → **Users** → ปุ่ม **Add user** → Create new user
2. Email: email ของอาจารย์
3. Password: ตั้งให้ (จด/ส่งให้แก) แนะนำ 12+ ตัวอักษร อย่าใช้รหัสง่าย ๆ
4. ✅ ติ๊ก **Auto Confirm User** เพื่อไม่ต้อง verify email
5. กด Create user

### 5. ดึงค่า config
1. Sidebar → **Project Settings** (icon เกียร์) → **API**
2. copy **Project URL** (เช่น `https://abc123.supabase.co`)
3. copy **anon public** key (ขึ้นต้นด้วย `eyJhbGci...`) — อย่า copy `service_role`!
4. เปิดไฟล์ `config.js` แก้ 2 บรรทัด:
   ```javascript
   SUPABASE_URL:      "https://abc123.supabase.co",         // ของจริง
   SUPABASE_ANON_KEY: "eyJhbGci...ของจริง...",
   ```

### 6. Deploy
**GitHub Pages (ฟรี วิธีง่ายสุด):**
1. สร้าง GitHub repo ใหม่ ของอาจารย์ — เช่น `southern-drive-office`
2. Upload ทั้ง folder (index.html, config.js, schema.sql, assets/...)
3. Repo Settings → Pages → Source: `main` branch → Save
4. รอ 1-2 นาที — เว็บอยู่ที่ `https://USERNAME.github.io/southern-drive-office/`
5. ส่ง link ให้อาจารย์ + email/password ที่สร้างไว้ขั้น 4

---

## วิธีใช้สำหรับอาจารย์

### หน้า Login
- พิมพ์ email + password → Sign in

### หน้าหลัก (Documents)
- **+ Invoice** → สร้างใบเสร็จ (tax invoice)
- **+ Quote** → ใบเสนอราคา (ใบประเมินก่อนตกลงทำ)
- **+ Cash sale** → ลูกค้าจ่ายสดเร็ว ๆ ไม่ออกใบ (แค่บันทึกรายได้)
- ค้นหาด้วยเลข/ชื่อ/เบอร์/ทะเบียน
- กดงานเก่าเพื่อแก้ไข หรือ Save as new ทำใบใหม่จากใบเก่า

### หน้า Money (กดการ์ดบนสุด)
- ดูรายได้ / ค่าอะไหล่ / กำไรขั้นต้น แยกตามเดือน / ไตรมาส / ปีภาษี
- **+ Add expense** บันทึกค่าอะไหล่ที่ซื้อ
- **Export CSV** ส่งให้นักบัญชี / ATO

### Status งาน
แต่ละงานเลือกได้: **Paid** (จ่ายแล้ว นับเป็นรายได้) / **Unpaid** (ค้างจ่าย) / **Cancelled** / **Quote** / **Draft** (ร่าง) — เฉพาะ Paid นับเป็นรายได้ในรายงาน

### Snippet
ในช่อง Notes พิมพ์อะไรที่ใช้บ่อย → กด **"+ Save as snippet"** → ตั้งชื่อ → ครั้งหน้ากดปุ่มเดียวเด้งเข้าใส่เลย

---

## รักษาความปลอดภัย

- **อย่าแชร์ password** กับคนอื่น
- **Backup เดือนละครั้ง**: หน้า Money → Export CSV → save ลง Google Drive ของอาจารย์
- **ทุก 2-3 เดือน** เข้า Supabase → Database → Backups → Download (เก็บไฟล์ไว้)
- **เปิดแอปบ้างทุก 5-6 วัน** ถ้าทิ้งเกิน 7 วัน Supabase free tier จะ pause project (data ไม่หาย แต่ต้องไปกด resume)

---

## ติดปัญหาตรงไหน

- ใส่ Supabase URL/key แล้ว login ไม่ได้ → เช็คว่า copy ครบไม่ตกท้าย
- งานไม่ขึ้น/ขึ้น error → เช็คว่ารัน schema.sql ครบหรือยัง (Auth tab ใน Supabase ดู Users มี email อาจารย์ไหม)
- รูปเอกสาร capricorn/arc ไม่ขึ้น → เช็คว่า upload `assets/capricorn.png` กับ `assets/arctick.png` แล้วหรือยัง
