# PROMPT LENGKAP - TmDash Nail & Beauty Studio
# Migrasi ke Next.js + Supabase + Deploy Vercel
# ==============================================
#
# CARA PAKAI:
# 1. Copy satu PROMPT (misal PROMPT 1), paste ke claude.ai
# 2. Tunggu Claude selesai jawab
# 3. Lanjut copy PROMPT 2, dst.
# 4. Total ada 8 prompt, kirim satu-satu
#
# ==============================================


================================================================
PROMPT 1 - SETUP SUPABASE + PROJECT NEXT.JS (copy mulai baris bawah ini)
================================================================

Saya mau buat aplikasi web "TmDash Nail & Beauty Studio" - sistem kasir/POS + halaman promo untuk nail & beauty studio. Saya mau pakai **Next.js (App Router) + Supabase + deploy di Vercel**.

Saya belum buat apa-apa. Belum punya akun Supabase maupun Vercel. Tolong guide dari NOL.

---

### LANGKAH 1: Panduan Buat Akun & Setup Supabase

Tolong berikan panduan lengkap step-by-step DENGAN SCREENSHOT DESCRIPTION:

**A. Buat Akun Supabase:**
1. Buka https://supabase.com → klik "Start your project"
2. Sign up pakai GitHub (recommended) atau email
3. Setelah login, klik "New Project"
4. Isi:
   - Organization: pilih yang ada / buat baru
   - Project name: `tmdash-nail`
   - Database password: (catat password ini!)
   - Region: Southeast Asia (Singapore) → paling dekat Indonesia
5. Klik "Create new project", tunggu ~2 menit

**B. Ambil API Keys:**
1. Setelah project ready, pergi ke Settings → API
2. Catat 2 hal ini:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (yang di bagian "Project API keys" → anon)

**C. Jalankan SQL Schema:**
1. Di Supabase dashboard, klik **SQL Editor** di sidebar kiri
2. Klik "New query"
3. Copy-paste SELURUH SQL di bawah ini, lalu klik **RUN**

Tolong buatkan SQL schema LENGKAP yang berisi:

```sql
-- Tabel services (layanan)
-- Kolom: id (bigint auto), name, category, price, emoji, created_at
-- Kategori: Nail Art, Nail Care, Beauty, Eyelash, Waxing, Paket

-- Tabel transactions (transaksi)
-- Kolom: id (text, format TRX-xxx), created_at, subtotal, total, cashier_name, cashier_id (uuid, ref auth.users)

-- Tabel transaction_items (item per transaksi)
-- Kolom: id (bigint auto), transaction_id (ref transactions), service_name, price, qty, subtotal

-- Tabel bookings (booking dari pengunjung)
-- Kolom: id (text, format BK-xxx), name, phone, service_id (ref services), service_name, service_price, booking_date, booking_time, notes, status (pending/confirmed/done/cancelled), created_at

-- Tabel profiles (profil admin)
-- Kolom: id (uuid, ref auth.users), full_name, role, created_at
-- Trigger: auto-create profile saat user baru register

-- RLS Policies:
-- services: SELECT untuk semua orang (publik bisa lihat), INSERT/UPDATE/DELETE hanya authenticated
-- bookings: INSERT untuk semua orang (publik bisa booking), SELECT/UPDATE hanya authenticated  
-- transactions: semua operasi hanya authenticated
-- transaction_items: semua operasi hanya authenticated
-- profiles: SELECT/UPDATE hanya user sendiri

-- SEED DATA: 20 layanan default:
-- Nail Care: Manicure Basic (75000,💅), Pedicure Basic (85000,🦶), Gel Manicure (120000,✨), Gel Pedicure (135000,💎), Nail Removal (50000,🔧)
-- Nail Art: Nail Art Simple (50000,🎨), Nail Art Medium (100000,🌸), Nail Art Complex (150000,👑), Nail Extension (200000,💫)
-- Eyelash: Eyelash Extension Natural (150000,👁️), Eyelash Extension Volume (250000,🦋), Eyelash Lift & Tint (175000,🌟)
-- Beauty: Facial Basic (150000,🧖), Facial Glowing (250000,✨)
-- Waxing: Waxing Underarm (50000,🍯), Waxing Full Leg (150000,🦵), Waxing Full Arm (100000,💪)
-- Paket: Paket Mani-Pedi (140000,🎀), Paket Bridal Nail (350000,💒), Paket Beauty Complete (500000,👸)
```

**D. Buat User Admin:**
1. Di Supabase dashboard → Authentication → Users
2. Klik "Add user" → "Create new user"
3. Email: `admin@tmdash.id`
4. Password: `admin123`
5. Centang "Auto Confirm User"
6. Klik "Create user"
7. Lalu pergi ke SQL Editor, jalankan:
```sql
UPDATE profiles SET full_name = 'Admin', role = 'Administrator' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@tmdash.id');
```

---

### LANGKAH 2: Setup Project Next.js

Setelah Supabase siap, buatkan project Next.js dengan struktur ini:

```
tmdash-nail/
├── app/
│   ├── layout.js
│   ├── page.js                 # Landing/promo (publik)
│   ├── globals.css
│   ├── login/page.js           # Login admin
│   ├── dashboard/
│   │   ├── layout.js           # Sidebar + auth guard
│   │   ├── page.js             # Dashboard stats
│   │   ├── pos/page.js         # Kasir/POS
│   │   ├── services/page.js    # CRUD layanan
│   │   ├── transactions/page.js
│   │   └── bookings/page.js
├── components/
│   ├── Sidebar.jsx
│   ├── Receipt.jsx
│   ├── BookingForm.jsx
│   └── ...
├── lib/
│   ├── supabase.js             # Client browser
│   ├── supabase-server.js      # Client server
│   └── utils.js
├── .env.local.example
├── package.json
└── next.config.js
```

Untuk PROMPT 1 ini, buatkan dulu:
1. **SQL schema lengkap** (tinggal copy-paste ke Supabase SQL Editor)
2. **package.json** (dependencies: next, react, react-dom, @supabase/supabase-js, @supabase/ssr)
3. **next.config.js**
4. **.env.local.example**
5. **lib/supabase.js** (createBrowserClient)
6. **lib/supabase-server.js** (createServerClient untuk server components)
7. **lib/utils.js** (formatRupiah, formatDate, formatTime, formatDateTime, generateId)

### Catatan penting:
- Next.js 14+ App Router (BUKAN Pages Router)
- `@supabase/supabase-js` v2 + `@supabase/ssr`
- JANGAN pakai Tailwind CSS. Pakai custom CSS (globals.css)
- Font: Poppins (Google Fonts)
- Icons: Font Awesome 6 (CDN)
- Bahasa UI: Indonesia
- Mata uang: Rupiah (Rp)
- Dark theme: background #0f0f1a, primary #e91e8c (pink), secondary #6c63ff

Saya akan bilang "lanjut" untuk file berikutnya.


================================================================
PROMPT 2 - HALAMAN PROMO PUBLIK (copy mulai baris bawah ini)
================================================================

Lanjut. Sekarang buatkan halaman landing/promo publik.

### File: `app/page.js` + styling di `app/globals.css`

Halaman ini bisa diakses TANPA login (publik). Isinya:

**1. Navbar (fixed, transparan, scrolled jadi blur)**
- Logo: icon spa + "TmDash" + "Nail & Beauty"
- Links: Beranda, Layanan, Paket, Galeri, Booking, Kontak
- Mobile: hamburger menu

**2. Hero Section**
- Badge: "Nail & Beauty Studio"
- Heading: "Tampil Cantik Mulai dari **Ujung Jari**" (gradient text)
- Subtitle: "Perawatan nail art, kecantikan, dan eyelash terbaik dengan sentuhan profesional..."
- 2 tombol: "Buat Janji" (pink solid) + "Lihat Layanan" (outline)
- Stats: 500+ Pelanggan Puas | 20+ Jenis Layanan | 5+ Tahun Pengalaman

**3. Section "Kenapa Kami" (background sedikit beda)**
- 4 card: Produk Premium (gem icon), Terapis Berpengalaman (user-md), Higienis & Steril (shield-alt), Pelayanan Terbaik (heart)

**4. Section Layanan**
- Ambil dari Supabase tabel `services` WHERE category != 'Paket'
- Filter kategori: Semua, Nail Art, Nail Care, Beauty, Eyelash, Waxing
- Card: emoji besar, nama, kategori kecil, harga pink, tombol "Booking Sekarang" → scroll ke form booking

**5. Section Paket Spesial (background beda)**
- Ambil dari Supabase WHERE category = 'Paket'
- 3 card besar:
  - Paket Mani-Pedi: deskripsi + 4 bullet includes + harga Rp 140.000
  - Paket Bridal Nail: BEST SELLER badge, 5 bullet includes + Rp 350.000
  - Paket Beauty Complete: 5 bullet includes + Rp 500.000
- Masing-masing ada tombol "Pilih Paket Ini" → scroll ke booking + pre-select layanan

**6. Section Galeri**
- 6 placeholder card (gradient background + icon + label)
- Grid 3 kolom, hover scale

**7. Section Booking**
- 2 kolom: kiri info (benefit, jam operasional, lokasi), kanan form
- Form: Nama, No WhatsApp, Pilih Layanan (dropdown dari DB, grouped by category), Tanggal (min = besok), Jam (09:00-20:00 per 30 menit), Catatan (opsional)
- Submit → insert ke Supabase tabel bookings (status: pending)
- Setelah sukses → modal konfirmasi dengan detail booking

**8. Section Testimoni**
- 3 card: Rina S. ("Nail art bagus detail tahan lama"), Dinda A. ("Eyelash extension natural"), Maya P. ("Paket bridal worth it")

**9. Footer**
- 4 kolom: Brand + sosmed, Menu links, Layanan links, Kontak (alamat, telp, email, jam)
- Copyright 2026

### Warna & Styling (dark theme):
```
--primary: #e91e8c
--secondary: #6c63ff
--accent: #ff6b9d
--bg-dark: #0f0f1a
--bg-section: #141425
--bg-card: #1a1a30
--text-light: #ffffff
--text-muted: #9a9ab0
--success: #00c897
--border: rgba(255,255,255,0.06)
--radius: 16px
```

Komponen ini harus `"use client"` karena ada interaktivitas (filter, form, modal).

Buatkan `app/page.js` dan SEMUA CSS yang dibutuhkan di `app/globals.css`.


================================================================
PROMPT 3 - LOGIN ADMIN (copy mulai baris bawah ini)
================================================================

Lanjut. Buatkan halaman login admin + auth system.

### File 1: `app/login/page.js`

Layout split 2 kolom:

**Kiri (flex 1):**
- Background: gradient 135deg dari #e91e8c ke #c4176f ke #6c63ff
- Logo: kotak rounded 80px, background rgba putih 0.2, icon spa besar putih
- "TmDash" (h1, 2rem, bold, putih)
- "Nail & Beauty Studio" (h2, 1rem, normal, putih 85%)
- "Sistem Kasir & Manajemen Studio" (p, 0.8rem, putih 60%)
- 3 decorative circles (border tipis putih 10%)

**Kanan (flex 1, background #16213e):**
- "Selamat Datang" (h3, 1.5rem, bold)
- "Silakan masuk ke akun admin Anda" (p, 0.85rem, muted)
- Error message box (merah, hidden by default)
- Form:
  - Username/Email: icon user + input
  - Password: icon lock + input + toggle eye button
  - Tombol "Masuk" (gradient pink, full width)
- Footer: "Default: admin@tmdash.id / admin123"

**Fungsionalitas:**
- Login pakai `supabase.auth.signInWithPassword({ email, password })`
- Jika berhasil → redirect ke `/dashboard`
- Jika gagal → tampilkan error "Email atau password salah!"
- Toggle show/hide password

### File 2: `middleware.js` (root project)
- Cek session Supabase
- Jika akses `/dashboard/*` tanpa login → redirect ke `/login`
- Jika sudah login akses `/login` → redirect ke `/dashboard`

### File 3: `app/auth/callback/route.js`
- Handle auth callback dari Supabase (untuk exchange code)

Styling login page pakai CSS yang sama dengan dark theme. Tambahkan styling ke globals.css.


================================================================
PROMPT 4 - DASHBOARD LAYOUT + HOME (copy mulai baris bawah ini)
================================================================

Lanjut. Buatkan dashboard layout dan halaman utama dashboard.

### File 1: `app/dashboard/layout.js`
- Cek auth (redirect ke /login jika belum login)
- Ambil user profile dari Supabase
- Render Sidebar + main content area
- Topbar dengan judul halaman + tanggal hari ini (Indonesia)

### File 2: `components/Sidebar.jsx` ("use client")

**Brand section (atas):**
- Icon spa pink + "TmDash" + "Nail & Beauty Studio"

**Navigation:**
- Dashboard (icon home)
- Kasir / POS (icon cash-register)
- Layanan (icon concierge-bell)
- Riwayat Transaksi (icon receipt)
- Booking (icon calendar-check) + **badge merah** jumlah booking pending

**Footer (bawah):**
- Avatar (initial huruf pertama, gradient pink-ungu, bulat)
- Nama + Role
- Tombol "Keluar" (border merah, hover jadi merah solid)

**Styling:**
- Width 260px, fixed, background #0f0f23
- Nav item: hover background pink 10%, active = gradient pink dengan shadow
- Mobile: transform translateX(-100%), toggle dengan hamburger

### File 3: `app/dashboard/page.js`

**4 Stat Cards (grid auto-fit min 240px):**
1. Pendapatan Hari Ini (pink icon wallet) → SUM total dari transactions WHERE created_at = today
2. Transaksi Hari Ini (blue icon shopping-bag) → COUNT transactions today
3. Total Layanan (green icon concierge-bell) → COUNT services
4. Pendapatan Bulan Ini (orange icon chart-line) → SUM total WHERE created_at = this month

**Tabel Transaksi Terakhir:**
- Header: "Transaksi Terakhir" + tombol "Transaksi Baru" → link ke /dashboard/pos
- Kolom: No Transaksi, Tanggal, Layanan, Total, Status (badge hijau "Lunas")
- Limit 5, order by created_at desc
- Jika kosong: "Belum ada transaksi"

Data diambil dari Supabase real-time.


================================================================
PROMPT 5 - KASIR / POS (copy mulai baris bawah ini)
================================================================

Lanjut. Buatkan halaman kasir/POS.

### File 1: `app/dashboard/pos/page.js` ("use client")

**Layout 2 kolom (grid: 1fr 380px):**

**Kolom Kiri - Pilih Layanan:**
- Header: "Pilih Layanan" + search box
- Category filters: Semua, Nail Art, Nail Care, Beauty, Eyelash, Waxing, Paket (button pill, active = pink solid)
- Grid layanan (auto-fill, min 180px): card dengan emoji 2rem, nama, harga pink
- Klik card = tambah ke keranjang
- Data dari Supabase tabel services

**Kolom Kanan - Keranjang:**
- Header: "Keranjang" + tombol "Kosongkan" (merah)
- List cart items: nama, harga x qty = subtotal, tombol +/- qty
- Jika kosong: icon basket + "Keranjang kosong"
- Summary: Subtotal + Total (pink, besar, bold)
- Tombol "Bayar" (pink, full width)
- Cart = React state (useState), BUKAN di database

**Proses Bayar:**
1. Generate ID: `TRX-` + random
2. Insert ke `transactions`: id, total, subtotal, cashier_name, cashier_id
3. Insert ke `transaction_items`: setiap item di cart
4. Clear cart
5. Tampilkan modal Receipt

### File 2: `components/Receipt.jsx`

Modal struk pembayaran (background putih, teks hitam):
- Header: "TmDash Nail & Beauty Studio", "Jl. Contoh Alamat No. 123", "Telp: 0812-3456-7890"
- Garis putus-putus (hr dashed)
- No transaksi, Tanggal & waktu, Kasir
- Tabel item: Layanan | Qty | Subtotal
- TOTAL (bold besar)
- Footer: "Terima kasih atas kunjungan Anda!" + "Beauty is our passion ✨"
- Tombol: Tutup + Cetak (window.print)


================================================================
PROMPT 6 - LAYANAN & TRANSAKSI (copy mulai baris bawah ini)
================================================================

Lanjut. Buatkan halaman kelola layanan dan riwayat transaksi.

### File 1: `app/dashboard/services/page.js` ("use client")

**Tabel layanan:**
- Header: "Daftar Layanan" + tombol "Tambah Layanan" (pink)
- Kolom: Nama Layanan (emoji + nama), Kategori (badge hijau), Harga (bold), Aksi (edit biru + hapus merah)
- Data dari Supabase `services` order by id

**Modal Tambah/Edit:**
- Judul: "Tambah Layanan" atau "Edit Layanan"
- Form: Nama (text), Kategori (dropdown: Nail Care, Nail Art, Beauty, Eyelash, Waxing, Paket), Harga (number), Emoji (text, max 4 char, default 💅)
- Tombol: Batal + Simpan
- Simpan = insert atau update ke Supabase
- Setelah simpan → refresh data, tutup modal

**Hapus:**
- Klik hapus → confirm("Hapus layanan ini?")
- Jika ya → delete dari Supabase → refresh

### File 2: `app/dashboard/transactions/page.js`

**Tabel transaksi:**
- Header: "Semua Transaksi"
- Kolom: No Transaksi (bold), Tanggal, Layanan (join items), Total (bold), Aksi (tombol mata/lihat)
- Data dari Supabase `transactions` + join `transaction_items`, order by created_at desc
- Jika kosong: "Belum ada transaksi"

**Lihat Detail:**
- Klik tombol mata → ambil transaksi + items dari Supabase → tampilkan di modal Receipt (reuse komponen)


================================================================
PROMPT 7 - KELOLA BOOKING (copy mulai baris bawah ini)
================================================================

Lanjut. Buatkan halaman kelola booking di admin.

### File: `app/dashboard/bookings/page.js` ("use client")

**3 Stat Cards (grid auto-fit):**
1. Menunggu Konfirmasi (orange icon clock) → COUNT bookings WHERE status = 'pending'
2. Dikonfirmasi (green icon check-circle) → COUNT WHERE status = 'confirmed'
3. Booking Hari Ini (blue icon calendar-day) → COUNT WHERE booking_date = today

**Header tabel:**
- "Daftar Booking" + tombol "Lihat Halaman Promo" (link ke / target blank)

**Tabel booking:**
- Kolom: No Booking (bold), Nama, Layanan + harga (pink kecil), Tanggal & Jam, WhatsApp, Status (badge), Aksi
- Status badges:
  - pending → badge kuning "Menunggu"
  - confirmed → badge hijau "Dikonfirmasi"
  - done → badge hijau "Selesai"
  - cancelled → badge merah "Dibatalkan"
- Aksi per status:
  - pending: tombol Konfirmasi (hijau check) + Batalkan (merah x)
  - confirmed: tombol Selesai (biru check-double)
  - done/cancelled: tidak ada tombol
- Order by created_at desc
- Jika kosong: "Belum ada booking"

**Update status:**
- Klik tombol → update status di Supabase → refresh data + refresh badge count di sidebar


================================================================
PROMPT 8 - DEPLOY KE VERCEL (copy mulai baris bawah ini)
================================================================

Lanjut. Sekarang bantu saya deploy ke Vercel. Saya belum punya akun Vercel.

### LANGKAH 1: Push ke GitHub

Berikan perintah Git lengkap:
```bash
# Inisialisasi (jika belum)
git init
git add .
git commit -m "feat: TmDash Nail & Beauty Studio - Next.js + Supabase"

# Buat repo di GitHub (bisa lewat github.com > New Repository)
# Nama repo: tmdash-nail
git remote add origin https://github.com/USERNAME/tmdash-nail.git
git branch -M main
git push -u origin main
```

### LANGKAH 2: Buat Akun Vercel & Deploy

Step-by-step:
1. Buka https://vercel.com → "Sign Up" → pilih "Continue with GitHub"
2. Authorize Vercel untuk akses GitHub
3. Setelah masuk dashboard, klik **"Add New..." → "Project"**
4. Pilih repo **tmdash-nail** dari list → klik **"Import"**
5. Di halaman configure:
   - Framework Preset: **Next.js** (biasanya auto-detect)
   - Root Directory: `./` (biarkan default)
   - Build Command: `next build` (default)
   - Output Directory: (biarkan default)
6. Buka section **"Environment Variables"**, tambahkan:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co     ← dari Supabase Settings > API
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...               ← dari Supabase Settings > API
   ```
7. Klik **"Deploy"**
8. Tunggu build selesai (~1-2 menit)
9. Setelah selesai, Vercel kasih URL: `https://tmdash-nail.vercel.app`

### LANGKAH 3: Setting Supabase untuk Production

Di Supabase dashboard:
1. Pergi ke **Authentication → URL Configuration**
2. Di **Site URL**, isi: `https://tmdash-nail.vercel.app`
3. Di **Redirect URLs**, tambahkan:
   - `https://tmdash-nail.vercel.app/**`
   - `http://localhost:3000/**` (untuk development)

### LANGKAH 4: Test

Berikan checklist test:
- [ ] Buka halaman promo (URL utama) → tampil landing page
- [ ] Coba booking dari halaman promo → cek di Supabase tabel bookings
- [ ] Login admin: admin@tmdash.id / admin123
- [ ] Dashboard → stat card tampil
- [ ] POS → pilih layanan, tambah ke cart, bayar → cek transaksi masuk
- [ ] Layanan → tambah/edit/hapus layanan
- [ ] Transaksi → lihat riwayat + detail struk
- [ ] Booking → konfirmasi/batalkan booking
- [ ] Logout → redirect ke login
- [ ] Mobile responsive → test di HP

### Troubleshooting umum:
1. **Build error "missing env"** → pastikan env variables sudah di-set di Vercel
2. **Login gagal** → pastikan user admin sudah dibuat di Supabase Auth
3. **Data kosong** → pastikan SQL schema + seed sudah dijalankan
4. **CORS error** → pastikan Site URL sudah benar di Supabase Auth settings
5. **Halaman 404** → pastikan routing Next.js benar (app/page.js, bukan pages/)

### Custom Domain (opsional):
Jika punya domain sendiri:
1. Di Vercel → Settings → Domains → Add
2. Masukkan domain (misal: tmdash.id)
3. Vercel kasih DNS records → tambahkan di domain registrar
4. Update juga Site URL di Supabase


================================================================
CATATAN UNTUK CLAUDE (sertakan di SETIAP prompt):
================================================================

ATURAN TEKNIS:
- Next.js 14+ App Router (BUKAN Pages Router)
- @supabase/supabase-js v2 + @supabase/ssr
- Komponen interaktif pakai "use client"
- JANGAN pakai Tailwind CSS, pakai custom CSS saja di globals.css
- Font: Poppins (Google Fonts), Icons: Font Awesome 6 (CDN link di layout.js)
- Bahasa UI: Indonesia, Mata uang: Rupiah (Rp), Tanggal: format Indonesia
- Dark theme warna: bg #0f0f1a, primary pink #e91e8c, secondary ungu #6c63ff
- Berikan KODE LENGKAP, jangan disingkat, jangan pakai "// ... rest of code"
