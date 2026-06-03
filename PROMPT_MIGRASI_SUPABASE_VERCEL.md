# PROMPT LENGKAP - TmDash Nail & Beauty Studio
# Next.js + Supabase + Deploy Vercel (DARI NOL PROJECT)
# =======================================================
#
# STATUS: Akun Supabase & Vercel SUDAH ADA, project belum dibuat
#
# CARA PAKAI:
# 1. Copy PROMPT 1, paste ke claude.ai → tunggu selesai
# 2. Ketik "lanjut" atau copy PROMPT 2 → dst sampai PROMPT 8
# 3. Ikuti instruksi manual (buat project Supabase, dll) di antara prompt
#
# =======================================================


================================================================
PROMPT 1 - BUAT PROJECT SUPABASE + SETUP NEXT.JS
================================================================

Saya mau buat aplikasi web "TmDash Nail & Beauty Studio" - sistem kasir/POS + halaman promo untuk nail & beauty studio.

Tech stack: **Next.js 14+ (App Router) + Supabase + deploy Vercel**.

Saya SUDAH punya akun Supabase dan Vercel, tapi belum buat project sama sekali.

---

### BAGIAN A: Panduan Buat Project Supabase

Tolong berikan panduan step-by-step yang jelas:

**1. Buat Project Baru di Supabase:**
- Buka https://supabase.com/dashboard
- Klik "New Project"
- Project name: `tmdash-nail`
- Database password: (apa saja, catat!)
- Region: **Southeast Asia (Singapore)**
- Klik "Create new project" → tunggu ~2 menit sampai ready

**2. Ambil API Keys:**
- Setelah project ready → pergi ke **Settings** (gear icon) → **API**
- Catat:
  - **Project URL**: `https://xxxxx.supabase.co`
  - **anon public key**: yang di bagian "Project API keys" → `anon`
- Kedua ini nanti dipakai di `.env.local` dan Vercel

**3. Jalankan SQL Schema:**
- Klik **SQL Editor** di sidebar kiri
- Klik "New query"
- Copy-paste SELURUH SQL di bawah, klik **RUN**

Buatkan SQL schema LENGKAP (satu file, tinggal run sekali) yang berisi:

```
TABEL services:
- id: bigint generated always as identity primary key
- name: text not null
- category: text not null (Nail Art / Nail Care / Beauty / Eyelash / Waxing / Paket)
- price: integer not null
- emoji: text default '💅'
- created_at: timestamptz default now()

TABEL transactions:
- id: text primary key (format TRX-xxx)
- subtotal: integer not null
- total: integer not null
- cashier_name: text
- cashier_id: uuid references auth.users
- created_at: timestamptz default now()

TABEL transaction_items:
- id: bigint generated always as identity primary key
- transaction_id: text references transactions(id) on delete cascade
- service_name: text not null
- price: integer not null
- qty: integer not null
- subtotal: integer not null

TABEL bookings:
- id: text primary key (format BK-xxx)
- name: text not null
- phone: text not null
- service_id: bigint references services(id)
- service_name: text not null
- service_price: integer not null
- booking_date: date not null
- booking_time: text not null
- notes: text
- status: text default 'pending' (pending / confirmed / done / cancelled)
- created_at: timestamptz default now()

TABEL profiles:
- id: uuid references auth.users primary key
- full_name: text
- role: text default 'Administrator'
- created_at: timestamptz default now()

TRIGGER: otomatis buat row di profiles saat user baru sign up di auth.users

RLS POLICIES (enable RLS di semua tabel):
- services: SELECT untuk anon+authenticated, INSERT/UPDATE/DELETE hanya authenticated
- bookings: INSERT untuk anon+authenticated (publik bisa booking), SELECT/UPDATE/DELETE hanya authenticated
- transactions: semua operasi hanya authenticated
- transaction_items: semua operasi hanya authenticated
- profiles: SELECT/UPDATE hanya user sendiri (auth.uid() = id)

SEED DATA 20 layanan:
1. Manicure Basic, Nail Care, 75000, 💅
2. Pedicure Basic, Nail Care, 85000, 🦶
3. Gel Manicure, Nail Care, 120000, ✨
4. Gel Pedicure, Nail Care, 135000, 💎
5. Nail Removal, Nail Care, 50000, 🔧
6. Nail Art Simple, Nail Art, 50000, 🎨
7. Nail Art Medium, Nail Art, 100000, 🌸
8. Nail Art Complex, Nail Art, 150000, 👑
9. Nail Extension, Nail Art, 200000, 💫
10. Eyelash Extension Natural, Eyelash, 150000, 👁️
11. Eyelash Extension Volume, Eyelash, 250000, 🦋
12. Eyelash Lift & Tint, Eyelash, 175000, 🌟
13. Facial Basic, Beauty, 150000, 🧖
14. Facial Glowing, Beauty, 250000, ✨
15. Waxing Underarm, Waxing, 50000, 🍯
16. Waxing Full Leg, Waxing, 150000, 🦵
17. Waxing Full Arm, Waxing, 100000, 💪
18. Paket Mani-Pedi, Paket, 140000, 🎀
19. Paket Bridal Nail, Paket, 350000, 💒
20. Paket Beauty Complete, Paket, 500000, 👸
```

**4. Buat User Admin:**
- Di Supabase → **Authentication** → **Users** → klik **"Add user"** → **"Create new user"**
- Email: `admin@tmdash.id`
- Password: `admin123`
- Centang **"Auto Confirm User"**
- Klik "Create user"
- Lalu buka SQL Editor lagi, run:
```sql
UPDATE profiles SET full_name = 'Admin', role = 'Administrator'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@tmdash.id');
```

---

### BAGIAN B: Setup Project Next.js

Buatkan file-file fondasi project:

**Struktur folder:**
```
tmdash-nail/
├── app/
│   ├── layout.js
│   ├── page.js                 # Landing/promo (publik)
│   ├── globals.css
│   ├── login/page.js
│   ├── auth/callback/route.js
│   ├── dashboard/
│   │   ├── layout.js
│   │   ├── page.js             # Stats
│   │   ├── pos/page.js
│   │   ├── services/page.js
│   │   ├── transactions/page.js
│   │   └── bookings/page.js
├── components/
│   ├── Sidebar.jsx
│   ├── Receipt.jsx
│   └── BookingForm.jsx
├── lib/
│   ├── supabase.js
│   ├── supabase-server.js
│   └── utils.js
├── middleware.js
├── .env.local.example
├── package.json
├── next.config.js
└── jsconfig.json
```

Untuk PROMPT 1 ini buatkan KODE LENGKAP (jangan disingkat):
1. **`package.json`** — dependencies: next, react, react-dom, @supabase/supabase-js, @supabase/ssr
2. **`next.config.js`**
3. **`jsconfig.json`** — path alias @/ ke root
4. **`.env.local.example`** — template NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
5. **`lib/supabase.js`** — createBrowserClient dari @supabase/ssr
6. **`lib/supabase-server.js`** — createServerClient untuk server components (pakai cookies dari next/headers)
7. **`lib/utils.js`** — formatRupiah, formatDate, formatTime, formatDateTime, generateTrxId, generateBookingId
8. **`middleware.js`** — cek auth Supabase, protect /dashboard/*, redirect logic
9. **`app/auth/callback/route.js`** — handle auth code exchange
10. **`app/layout.js`** — root layout (html lang="id", Poppins font, Font Awesome CDN)
11. **SQL schema lengkap** — satu file tinggal copy-paste ke Supabase SQL Editor

Saya akan bilang "lanjut" untuk file berikutnya.

---
CATATAN TEKNIS (berlaku untuk semua prompt):
- Next.js 14+ App Router, BUKAN Pages Router
- @supabase/supabase-js v2 + @supabase/ssr
- Komponen interaktif: "use client"
- JANGAN pakai Tailwind CSS, pakai custom CSS di globals.css
- Font: Poppins (Google Fonts), Icons: Font Awesome 6 (CDN)
- Bahasa UI: Indonesia, Mata uang: Rupiah (Rp), Format tanggal: Indonesia
- Dark theme: bg #0f0f1a/#141425/#1a1a30, primary #e91e8c, secondary #6c63ff
- KODE HARUS LENGKAP, jangan potong, jangan pakai "// ... rest of code"


================================================================
PROMPT 2 - HALAMAN PROMO PUBLIK + BOOKING (copy mulai sini)
================================================================

Lanjut. Sekarang buatkan halaman landing/promo publik yang bisa diakses TANPA login.

### File: `app/page.js` ("use client") + tambahan CSS di `app/globals.css`

Halaman lengkap satu page dengan section-section:

**1. Navbar (fixed top, transparan → scroll jadi blur gelap)**
- Logo: icon fa-spa pink + "TmDash" bold + "Nail & Beauty" kecil muted
- Menu: Beranda, Layanan, Paket, Galeri, Booking, Kontak (smooth scroll)
- Mobile: hamburger toggle

**2. Hero**
- Badge pill: "Nail & Beauty Studio"
- H1: "Tampil Cantik Mulai dari **Ujung Jari**" → "Ujung Jari" pakai gradient text pink-ungu
- Paragraf deskripsi
- 2 tombol: "Buat Janji" (solid pink) + "Lihat Layanan" (outline putih)
- 3 stats bawah: 500+ Pelanggan Puas | 20+ Jenis Layanan | 5+ Tahun Pengalaman
- Background: radial gradient pink & ungu subtle

**3. Section "Kenapa Kami" (bg #141425)**
- 4 card grid: Produk Premium (fa-gem), Terapis Berpengalaman (fa-user-md), Higienis & Steril (fa-shield-alt), Pelayanan Terbaik (fa-heart)
- Card: bg #1a1a30, icon di kotak gradient, hover naik + border pink

**4. Section Layanan (bg #0f0f1a)**
- Fetch services dari Supabase WHERE category != 'Paket'
- Filter pill buttons: Semua, Nail Art, Nail Care, Beauty, Eyelash, Waxing
- Grid 4 kolom card: emoji 2.5rem, nama, kategori kecil muted, harga pink bold, tombol "Booking Sekarang" → scroll ke #booking + pre-select layanan

**5. Section Paket Spesial (bg #141425)**
- Fetch services WHERE category = 'Paket'
- 3 card besar:
  - Paket Mani-Pedi Rp140.000: Manicure lengkap, Pedicure lengkap, Nail polish pilihan, Hand & foot massage
  - Paket Bridal Nail Rp350.000 (BEST SELLER ribbon): Gel manicure premium, Nail art custom design, Pedicure lengkap, Nail extension (opsional), Free 1x touch up
  - Paket Beauty Complete Rp500.000: Gel manicure & pedicure, Nail art medium, Eyelash extension natural, Facial glowing, Free aftercare kit
- Tombol "Pilih Paket Ini" → scroll ke booking + pre-select

**6. Section Galeri (bg #0f0f1a)**
- 6 placeholder card (gradient colorful + icon + label): Nail Art Floral, Gel Extension, Eyelash Volume, Facial Glowing, Chrome Nails, Bridal Set
- Grid 3 kolom, aspect-ratio 1, hover scale

**7. Section Booking (bg #141425)**
- 2 kolom grid:
  - Kiri (info card): "Kenapa Harus Booking?" → 4 bullet benefit (check icon hijau), Jam Operasional (Sen-Sab 09-21, Ming 10-20), Lokasi
  - Kanan (form card):
    - Row: Nama + No WhatsApp
    - Pilih Layanan (select, optgroup per kategori, dari Supabase)
    - Row: Tanggal (min besok) + Jam (select 09:00-20:00 per 30 menit)
    - Catatan (textarea opsional)
    - Tombol "Konfirmasi Booking" full width pink
    - Submit → INSERT ke Supabase tabel bookings (status 'pending')
    - Sukses → modal popup: icon check hijau, "Booking Berhasil!", detail (no booking, layanan, harga, tanggal, jam, WA), "Kami akan menghubungi via WhatsApp", tombol "Oke, Mengerti!"

**8. Section Testimoni (bg #0f0f1a)**
- 3 card: bintang 5 kuning, kutipan italic, avatar (initial + gradient) + nama + label
  - Rina S. / Pelanggan Setia: "Nail art-nya bagus banget! Detail dan tahan lama..."
  - Dinda A. / Pelanggan Baru: "Eyelash extension-nya natural banget, suka!..."
  - Maya P. / Bride-to-be: "Paket bridal nail-nya worth it banget!..."

**9. Footer (bg #141425, border top)**
- 4 kolom: Brand (logo+desc+sosmed icons), Menu links, Layanan links, Kontak (alamat, telp, email, jam)
- Copyright bottom: "2026 TmDash Nail & Beauty Studio"

Buatkan SEMUA kode `app/page.js` dan SEMUA CSS tambahan di `app/globals.css` secara LENGKAP.


================================================================
PROMPT 3 - HALAMAN LOGIN ADMIN (copy mulai sini)
================================================================

Lanjut. Buatkan halaman login admin.

### File: `app/login/page.js` ("use client")

**Layout: 2 kolom (flexbox), border-radius 16px, max-width 900px, center di tengah halaman**

**Kolom Kiri (flex 1):**
- Background: linear-gradient 135deg #e91e8c → #c4176f → #6c63ff
- Di tengah (centered):
  - Kotak logo: 80x80px, rounded 20px, bg rgba(255,255,255,0.2), icon fa-spa 2.2rem putih
  - "TmDash" (h1, 2rem, bold, putih)
  - "Nail & Beauty Studio" (h2, 1rem, putih 85%)
  - "Sistem Kasir & Manajemen Studio" (p, 0.8rem, putih 60%)
- 3 decorative circle (border 2px solid rgba putih 10%, position absolute)

**Kolom Kanan (flex 1, bg #16213e):**
- Form container max-width 340px centered:
  - "Selamat Datang" (h3, 1.5rem, bold, putih)
  - "Silakan masuk ke akun admin Anda" (p, muted)
  - Error message (hidden default): bg merah 10%, border merah 30%, icon + text
  - Input Email: label "Email" + icon fa-user, placeholder "Masukkan email"
  - Input Password: label "Password" + icon fa-lock, placeholder "Masukkan password", toggle eye button
  - Tombol "Masuk" (gradient pink, full width, icon fa-sign-in-alt)
  - Footer: "Default: admin@tmdash.id / admin123"

**Fungsionalitas:**
- Login: `supabase.auth.signInWithPassword({ email, password })`
- Berhasil → `router.push('/dashboard')`
- Gagal → tampilkan error "Email atau password salah!"
- Toggle password: ganti type text/password, ganti icon fa-eye / fa-eye-slash
- Jika sudah login → auto redirect ke /dashboard

**Responsive:** kolom kiri-kanan jadi atas-bawah di mobile (flex-direction column)

Tambahkan CSS login ke globals.css. Kode LENGKAP.


================================================================
PROMPT 4 - DASHBOARD LAYOUT + HALAMAN HOME (copy mulai sini)
================================================================

Lanjut. Buatkan dashboard layout dan halaman utama.

### File 1: `app/dashboard/layout.js`
- Server component
- Cek session: ambil user dari Supabase server client, jika tidak ada → redirect('/login')
- Ambil profile dari tabel profiles
- Ambil count bookings pending (untuk badge)
- Render: Sidebar (pass user data + pending count) + `<main>{children}</main>` + Topbar

### File 2: `components/Sidebar.jsx` ("use client")

Props: user (name, role), pendingBookings (number), currentPath

**Struktur:**
- Brand: icon fa-spa + "TmDash" + "Nail & Beauty Studio"
- Nav items (highlight active berdasarkan currentPath):
  - /dashboard → fa-home "Dashboard"
  - /dashboard/pos → fa-cash-register "Kasir / POS"
  - /dashboard/services → fa-concierge-bell "Layanan"
  - /dashboard/transactions → fa-receipt "Riwayat Transaksi"
  - /dashboard/bookings → fa-calendar-check "Booking" + badge merah (jika pending > 0)
- Footer:
  - Avatar initial (huruf pertama nama, bulat, gradient pink-ungu)
  - Nama + Role
  - Tombol "Keluar": supabase.auth.signOut() → redirect /login

**Styling sidebar:**
- Width 260px, fixed, height 100vh, bg #0f0f23, border-right
- Nav item: padding 12px 16px, rounded 10px, hover pink 10%, active = gradient pink + shadow pink
- Badge: min-width 20px, bg merah, rounded pill, font 0.7rem
- Main content: margin-left 260px
- Mobile: sidebar transform translateX(-100%), toggle open, main margin-left 0

### File 3: `app/dashboard/page.js` ("use client")

**4 Stat Cards (grid auto-fit min 240px, gap 20px):**
1. 💰 Pendapatan Hari Ini (icon wallet, bg pink 15%) → query: `SELECT COALESCE(SUM(total),0) FROM transactions WHERE created_at::date = CURRENT_DATE`
2. 🛍️ Transaksi Hari Ini (icon shopping-bag, bg blue 15%) → COUNT today
3. 💇 Total Layanan (icon concierge-bell, bg green 15%) → COUNT services
4. 📈 Pendapatan Bulan Ini (icon chart-line, bg orange 15%) → SUM this month

**Tabel "Transaksi Terakhir":**
- Header: judul + tombol "Transaksi Baru" (pink) → link /dashboard/pos
- Kolom: No Transaksi (bold), Tanggal, Layanan, Total (bold), Status (badge hijau "Lunas")
- Query: transactions + transaction_items, order created_at desc, limit 5
- Layanan: gabung nama items dengan koma
- Kosong: "Belum ada transaksi" centered muted

Fetch data dari Supabase. Kode LENGKAP.


================================================================
PROMPT 5 - KASIR / POS (copy mulai sini)
================================================================

Lanjut. Buatkan halaman kasir/POS.

### File 1: `app/dashboard/pos/page.js` ("use client")

**Layout: grid 2 kolom (1fr 380px), gap 20px, height calc(100vh - 130px)**

**Kolom Kiri - Pilih Layanan (card bg #16213e, rounded 12px):**
- Header: "Pilih Layanan" (icon fa-spa) + search box (icon search + input, bg rgba putih 5%)
- Filter kategori (horizontal scroll): Semua, Nail Art, Nail Care, Beauty, Eyelash, Waxing, Paket → pill buttons, active = pink solid
- Grid layanan (auto-fill min 180px, scroll overflow):
  - Card: bg rgba putih 3%, border, rounded 10px, padding 18px, center
  - Emoji 2rem, nama 0.85rem, harga pink bold
  - Hover: border pink, translateY -2px, shadow pink
  - Klik = addToCart(service)
- Fetch dari Supabase `services` order by id
- Filter by category + search by name

**Kolom Kanan - Keranjang (card bg #16213e):**
- Header: "Keranjang" (icon cart) + tombol "Kosongkan" (merah kecil)
- Cart items list (scroll):
  - Per item: nama + "harga x qty = total" + tombol -/qty/+ 
  - Tombol qty: 28x28px rounded, border, hover pink
- Kosong: icon fa-shopping-basket + "Keranjang kosong" (muted, center)
- Summary: Subtotal + Total (pink 1.1rem bold, border-top)
- Tombol "Bayar" (pink, full width, icon fa-check-circle)
- Cart = useState array [{id, name, price, qty}]

**Proses Bayar (processPayment):**
1. Jika cart kosong → return
2. Generate id: `'TRX-' + random`
3. Hitung total
4. Ambil user dari Supabase auth
5. Insert ke transactions: {id, subtotal, total, cashier_name, cashier_id}
6. Insert ke transaction_items: setiap cart item → {transaction_id, service_name, price, qty, subtotal}
7. Clear cart
8. Tampilkan Receipt modal

### File 2: `components/Receipt.jsx` ("use client")

Props: transaction (object), onClose (function)

**Modal overlay (bg hitam 60%, blur, centered):**

**Struk (background putih, teks #333, padding 30px, max-width 400px):**
- Header center: "TmDash Nail & Beauty Studio" (warna #e91e8c), "Jl. Contoh Alamat No. 123", "Telp: 0812-3456-7890"
- Hr dashed #ddd
- No: [id], Tanggal: [formatted], Kasir: [name]
- Hr dashed
- Tabel: Layanan | Qty | Subtotal (font kecil, warna gelap)
- Hr dashed
- TOTAL: bold besar, flex space-between
- Footer center: "Terima kasih atas kunjungan Anda!", "Beauty is our passion ✨"

**Footer modal:** tombol Tutup (secondary) + Cetak (pink, icon fa-print → window.print())

**Responsive:** di mobile grid jadi 1 kolom, cart max-height 500px.

Kode LENGKAP semua.


================================================================
PROMPT 6 - KELOLA LAYANAN + RIWAYAT TRANSAKSI (copy mulai sini)
================================================================

Lanjut. Buatkan halaman kelola layanan dan riwayat transaksi.

### File 1: `app/dashboard/services/page.js` ("use client")

**Tabel Layanan (card bg #16213e, rounded, border):**
- Header: "Daftar Layanan" (icon fa-list) + tombol "Tambah Layanan" (pink, icon fa-plus)
- Kolom tabel: Nama Layanan (emoji + nama), Kategori (badge hijau), Harga (bold Rp), Aksi
- Aksi: tombol Edit (biru kecil, icon fa-edit) + Hapus (merah kecil, icon fa-trash)
- Data: fetch Supabase `services` order by id

**Modal Tambah/Edit Layanan:**
- Header: "Tambah Layanan" atau "Edit Layanan" + tombol X close
- Form:
  - Nama Layanan (text input, placeholder "Contoh: Manicure Basic")
  - Kategori (select: Nail Care, Nail Art, Beauty, Eyelash, Waxing, Paket)
  - Harga Rp (number input, placeholder "75000")
  - Emoji (text input, placeholder "💅", maxLength 4)
- Footer: Batal (secondary) + Simpan (pink, icon fa-save)
- Tambah → supabase.from('services').insert({...})
- Edit → supabase.from('services').update({...}).eq('id', id)
- Setelah simpan → refresh list, tutup modal

**Hapus:**
- Klik hapus → window.confirm("Hapus layanan ini?")
- Ya → supabase.from('services').delete().eq('id', id)
- Refresh list

### File 2: `app/dashboard/transactions/page.js` ("use client")

**Tabel Transaksi (card):**
- Header: "Semua Transaksi" (icon fa-receipt)
- Kolom: No Transaksi (bold), Tanggal (formatted), Layanan (gabung nama items, potong jika panjang), Total (bold Rp), Aksi
- Aksi: tombol Lihat (biru, icon fa-eye)
- Data: fetch transactions order by created_at desc
- Untuk setiap transaksi, fetch transaction_items
- Kosong: "Belum ada transaksi"

**Lihat Detail:**
- Klik tombol lihat → fetch transaction + items dari Supabase
- Tampilkan di modal Receipt (reuse komponen dari POS)

Kode LENGKAP.


================================================================
PROMPT 7 - KELOLA BOOKING (copy mulai sini)
================================================================

Lanjut. Buatkan halaman kelola booking di admin.

### File: `app/dashboard/bookings/page.js` ("use client")

**3 Stat Cards (grid auto-fit):**
1. Menunggu Konfirmasi (icon fa-clock, bg orange 15%) → COUNT WHERE status='pending'
2. Dikonfirmasi (icon fa-check-circle, bg green 15%) → COUNT WHERE status='confirmed'
3. Booking Hari Ini (icon fa-calendar-day, bg blue 15%) → COUNT WHERE booking_date = today

**Tabel Booking (card):**
- Header: "Daftar Booking" (icon fa-calendar-check) + tombol "Lihat Halaman Promo" (secondary, icon fa-external-link-alt, link ke / target _blank)
- Kolom: No Booking (bold), Nama, Layanan (nama + harga pink kecil di bawah), Tanggal & Jam (tanggal + jam WIB di bawah), WhatsApp, Status (badge), Aksi

**Status badges:**
- pending → badge kuning "Menunggu"
- confirmed → badge hijau "Dikonfirmasi"
- done → badge hijau "Selesai"
- cancelled → badge merah "Dibatalkan"

**Tombol Aksi per status:**
- pending: Konfirmasi (hijau btn-sm, icon fa-check) + Batalkan (merah btn-sm, icon fa-times)
- confirmed: Selesai (biru btn-sm, icon fa-check-double)
- done / cancelled: tidak ada tombol

**Update status:**
- Klik tombol → supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
- Refresh data tabel + refresh stat cards

Data: fetch bookings order by created_at desc. Kosong: "Belum ada booking"

Kode LENGKAP.


================================================================
PROMPT 8 - DEPLOY KE VERCEL (copy mulai sini)
================================================================

Lanjut. Sekarang bantu saya deploy ke Vercel. Saya sudah punya akun Vercel, belum buat project.

### LANGKAH 1: Siapkan Repository GitHub

Berikan perintah terminal lengkap:
```
cd tmdash-nail
git init
git add .
git commit -m "feat: TmDash Nail & Beauty Studio - Next.js + Supabase"
```
Lalu buat repository baru di GitHub:
- Buka https://github.com/new
- Repository name: `tmdash-nail`
- Visibility: Public atau Private
- Jangan centang apapun (no README, no gitignore)
- Klik "Create repository"
- Lalu run di terminal:
```
git remote add origin https://github.com/USERNAMESAYA/tmdash-nail.git
git branch -M main
git push -u origin main
```

### LANGKAH 2: Deploy di Vercel

1. Buka https://vercel.com/dashboard
2. Klik **"Add New..."** → **"Project"**
3. Di bagian "Import Git Repository" → cari **tmdash-nail** → klik **"Import"**
4. Di halaman Configure Project:
   - **Framework Preset**: Next.js (biasanya auto-detect)
   - **Root Directory**: `./` (default)
   - Buka bagian **"Environment Variables"**
   - Tambahkan 2 variabel:
     ```
     Name: NEXT_PUBLIC_SUPABASE_URL
     Value: https://xxxxx.supabase.co          ← dari Supabase Settings > API

     Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
     Value: eyJhbGci...                         ← dari Supabase Settings > API > anon key
     ```
5. Klik **"Deploy"**
6. Tunggu build ~1-3 menit
7. Selesai! URL: `https://tmdash-nail.vercel.app` (atau nama random dari Vercel)

### LANGKAH 3: Setting Supabase untuk Domain Vercel

1. Buka Supabase dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: isi `https://tmdash-nail.vercel.app` (URL dari Vercel)
3. **Redirect URLs**: klik Add dan tambahkan:
   - `https://tmdash-nail.vercel.app/**`
   - `http://localhost:3000/**`
4. Klik Save

### LANGKAH 4: Test Semua Fitur

Checklist:
```
[ ] Buka URL Vercel → halaman promo tampil dengan layanan dari database
[ ] Scroll ke booking → isi form → submit → muncul modal sukses
[ ] Cek di Supabase tabel bookings → data masuk
[ ] Buka /login → login admin@tmdash.id / admin123
[ ] Dashboard → stat card tampil (mungkin masih 0)
[ ] POS → layanan muncul → tambah ke cart → bayar → struk tampil
[ ] Cek dashboard → pendapatan + transaksi terupdate
[ ] Layanan → tambah layanan baru → edit → hapus
[ ] Riwayat Transaksi → list muncul → klik lihat detail
[ ] Booking → booking dari promo muncul → konfirmasi → selesai
[ ] Logout → redirect ke login
[ ] Test di HP (responsive)
```

### Troubleshooting:

| Masalah | Solusi |
|---------|--------|
| Build error di Vercel | Cek log build, biasanya missing env variable → tambahkan di Vercel > Settings > Environment Variables, lalu re-deploy |
| Login gagal / error | Pastikan user admin sudah dibuat di Supabase Auth + Auto Confirm dicentang |
| Data kosong | Pastikan SQL schema + seed sudah di-run di Supabase SQL Editor |
| Halaman promo kosong | Cek RLS policy services → harus ada SELECT untuk anon |
| Booking gagal dari publik | Cek RLS policy bookings → harus ada INSERT untuk anon |
| Redirect loop di login | Cek Supabase Auth > URL Configuration > Site URL harus match URL Vercel |
| 404 setelah login | Pastikan middleware.js ada dan benar |

### Update Setelah Deploy (kalau ada perubahan kode):
```
git add .
git commit -m "update: deskripsi perubahan"
git push
```
Vercel otomatis re-deploy setiap ada push ke main.

### Custom Domain (opsional, jika punya domain):
1. Vercel → Project → Settings → Domains → Add
2. Masukkan domain (misal: tmdash.id atau studio.tmdash.id)
3. Vercel tampilkan DNS record → tambahkan di domain registrar Anda
4. Tunggu propagasi DNS (~5-30 menit)
5. Update juga Site URL di Supabase Auth settings


================================================================
CATATAN YANG HARUS DISERTAKAN DI SETIAP PROMPT:
================================================================

ATURAN TEKNIS (copy tempel di akhir setiap prompt jika Claude lupa):
- Next.js 14+ App Router, BUKAN Pages Router
- @supabase/supabase-js v2 + @supabase/ssr
- Komponen interaktif: "use client"
- JANGAN pakai Tailwind CSS, pakai custom CSS di globals.css
- Font: Poppins (Google Fonts), Icons: Font Awesome 6 (CDN di layout.js)
- Bahasa UI: Indonesia, Mata uang: Rupiah, Tanggal: format Indonesia
- Dark theme: bg #0f0f1a, primary #e91e8c, secondary #6c63ff
- KODE HARUS LENGKAP, jangan potong, jangan pakai "// ... sisa kode"
