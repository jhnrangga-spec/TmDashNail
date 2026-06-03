# ============================================================
# PROMPT LANJUTAN - TmDash Nail & Beauty Studio
# Migrasi dari Vanilla HTML/JS ke Next.js + Supabase + Vercel
# ============================================================
#
# SITUASI:
# - Akun Supabase & Vercel SUDAH ADA
# - Project Supabase & Vercel BELUM dibuat
# - Aplikasi vanilla HTML/CSS/JS SUDAH SELESAI (localStorage)
# - Perlu migrasi ke Next.js + Supabase + deploy Vercel
#
# CARA PAKAI:
# 1. Buka claude.ai (browser) → buat conversation baru
# 2. Copy PROMPT 1 → paste → tunggu selesai
# 3. Bilang "lanjut" atau copy PROMPT berikutnya
# 4. Ikuti instruksi manual di antara prompt
#
# ============================================================


###############################################################
PROMPT 1 — SQL SCHEMA + SETUP SUPABASE + FONDASI NEXT.JS
(copy dari baris === START === sampai === END ===)
###############################################################

=== START PROMPT 1 ===

Saya punya aplikasi web "TmDash Nail & Beauty Studio" (sistem kasir/POS + halaman promo). Versi vanilla HTML/CSS/JS sudah selesai, sekarang saya mau migrasi ke **Next.js 14 App Router + Supabase + deploy Vercel**.

Akun Supabase & Vercel sudah ada, tapi project belum dibuat.

---

## PART A: Panduan Buat Project Supabase (manual)

Berikan panduan singkat:
1. Buka https://supabase.com/dashboard → New Project → nama: `tmdash-nail`, region: Singapore
2. Tunggu ready → pergi ke **Settings > API** → catat **Project URL** dan **anon key**
3. Buka **SQL Editor** → New query → paste SQL dari bawah → klik RUN
4. Buka **Authentication > Users** → Add user → email: `admin@tmdash.id`, password: `admin123`, centang Auto Confirm
5. Buka SQL Editor lagi → run: `UPDATE profiles SET full_name='Admin', role='Administrator' WHERE id=(SELECT id FROM auth.users WHERE email='admin@tmdash.id');`

## PART B: Buatkan SQL Schema Lengkap

Satu file SQL, tinggal copy-paste ke Supabase SQL Editor. Harus berisi:

**Tabel `services`:**
- id bigint generated always as identity PK
- name text not null, category text not null, price integer not null, emoji text default '💅'
- created_at timestamptz default now()

**Tabel `transactions`:**
- id text PK (format TRX-xxx)
- subtotal integer, total integer, cashier_name text, cashier_id uuid ref auth.users
- created_at timestamptz default now()

**Tabel `transaction_items`:**
- id bigint auto PK
- transaction_id text ref transactions(id) on delete cascade
- service_name text, price integer, qty integer, subtotal integer

**Tabel `bookings`:**
- id text PK (format BK-xxx)
- name text, phone text, service_id bigint ref services(id), service_name text, service_price integer
- booking_date date, booking_time text, notes text
- status text default 'pending' (pending/confirmed/done/cancelled)
- created_at timestamptz default now()

**Tabel `profiles`:**
- id uuid ref auth.users PK
- full_name text, role text default 'Administrator', created_at timestamptz default now()
- Trigger: auto-create profile saat user baru register

**RLS Policies:**
- services: SELECT anon+authenticated; INSERT/UPDATE/DELETE authenticated only
- bookings: INSERT anon+authenticated; SELECT/UPDATE/DELETE authenticated only
- transactions + transaction_items: ALL authenticated only
- profiles: SELECT/UPDATE own row only

**Seed 20 layanan:**
```
Nail Care: Manicure Basic 75000💅, Pedicure Basic 85000🦶, Gel Manicure 120000✨, Gel Pedicure 135000💎, Nail Removal 50000🔧
Nail Art: Simple 50000🎨, Medium 100000🌸, Complex 150000👑, Extension 200000💫
Eyelash: Natural 150000👁️, Volume 250000🦋, Lift&Tint 175000🌟
Beauty: Facial Basic 150000🧖, Facial Glowing 250000✨
Waxing: Underarm 50000🍯, Full Leg 150000🦵, Full Arm 100000💪
Paket: Mani-Pedi 140000🎀, Bridal Nail 350000💒, Beauty Complete 500000👸
```

## PART C: Setup Next.js

Buatkan KODE LENGKAP untuk file-file fondasi:

```
tmdash-nail/
├── app/
│   ├── layout.js          # html lang=id, Poppins font, FA6 CDN, metadata
│   ├── globals.css         # CSS variables saja dulu (semua warna + reset)
│   ├── auth/callback/route.js
│   ├── login/page.js       # (placeholder kosong dulu)
│   ├── dashboard/
│   │   ├── layout.js       # (placeholder dulu)
│   │   └── page.js         # (placeholder dulu)
├── lib/
│   ├── supabase.js         # createBrowserClient (@supabase/ssr)
│   ├── supabase-server.js  # createServerClient (cookies dari next/headers)
│   └── utils.js            # formatRupiah, formatDate, formatTime, formatDateTime, generateTrxId, generateBookingId
├── middleware.js            # protect /dashboard/*, redirect logic
├── package.json            # next react react-dom @supabase/supabase-js @supabase/ssr
├── next.config.js
├── jsconfig.json           # alias @/
└── .env.local.example
```

### Referensi utils.js dari kode asli saya:
```javascript
function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function formatDateTime(dateStr) { return formatDate(dateStr) + ' ' + formatTime(dateStr); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
```

### Aturan:
- Next.js 14+ App Router, BUKAN Pages Router
- @supabase/supabase-js v2 + @supabase/ssr
- JANGAN pakai Tailwind CSS, pakai custom CSS
- Font: Poppins (Google Fonts CDN), Icons: Font Awesome 6 (CDN)
- Bahasa: Indonesia, Mata uang: Rupiah, Dark theme
- Warna: bg #0f0f1a, #141425, #1a1a30, primary #e91e8c, secondary #6c63ff, text #fff/#9a9ab0
- KODE LENGKAP, jangan disingkat

Saya bilang "lanjut" untuk prompt berikutnya.

=== END PROMPT 1 ===


###############################################################
PROMPT 2 — HALAMAN PROMO PUBLIK (LANDING PAGE + BOOKING)
###############################################################

=== START PROMPT 2 ===

Lanjut. Buatkan halaman promo publik (app/page.js) + semua CSS-nya di globals.css.

Halaman ini diakses TANPA login. "use client" karena ada interaktivitas.

Ini kode asli saya untuk referensi tampilan dan logic yang harus dipertahankan:

**HTML struktur (promo.html asli):**
- Navbar fixed: logo TmDash + menu Beranda/Layanan/Paket/Galeri/Booking/Kontak
- Hero: badge "Nail & Beauty Studio", h1 "Tampil Cantik Mulai dari Ujung Jari" (gradient text), 2 tombol, stats 500+/20+/5+
- Section Kenapa Kami: 4 feature card (Produk Premium, Terapis Berpengalaman, Higienis & Steril, Pelayanan Terbaik)
- Section Layanan: fetch services dari Supabase (bukan localStorage!) WHERE category!='Paket', filter kategori pills, grid card (emoji+nama+harga+tombol booking)
- Section Paket: fetch WHERE category='Paket', 3 package card dengan detail includes:
  - Mani-Pedi: Manicure lengkap, Pedicure lengkap, Nail polish pilihan, Hand & foot massage
  - Bridal Nail (BEST SELLER): Gel manicure premium, Nail art custom design, Pedicure lengkap, Nail extension (opsional), Free 1x touch up
  - Beauty Complete: Gel mani&pedi, Nail art medium, Eyelash extension natural, Facial glowing, Free aftercare kit
- Section Galeri: 6 gradient placeholder (Nail Art Floral, Gel Extension, Eyelash Volume, Facial Glowing, Chrome Nails, Bridal Set)
- Section Booking: kiri=info+benefit+jam operasional, kanan=form (nama, WA, layanan dropdown grouped, tanggal min besok, jam 09:00-20:00 per 30min, catatan) → insert Supabase bookings → modal sukses
- Testimoni: 3 card (Rina S, Dinda A, Maya P)
- Footer: 4 kolom brand+sosmed, menu, layanan, kontak

**Logic booking dari kode asli:**
```javascript
function submitBooking(e) {
    e.preventDefault();
    const name = document.getElementById('book-name').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const serviceId = parseInt(document.getElementById('book-service').value);
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;
    const notes = document.getElementById('book-notes').value.trim();
    const service = services.find(s => s.id === serviceId);
    const booking = {
        id: 'BK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2,3).toUpperCase(),
        name, phone, serviceId, serviceName: service.name, servicePrice: service.price,
        date, time, notes, status: 'pending', createdAt: new Date().toISOString()
    };
    // INSERT ke Supabase tabel bookings (bukan localStorage)
}
```

**CSS harus dark theme:**
```
--primary: #e91e8c; --secondary: #6c63ff; --accent: #ff6b9d;
--bg-dark: #0f0f1a; --bg-section: #141425; --bg-card: #1a1a30;
--text-light: #fff; --text-muted: #9a9ab0; --success: #00c897;
--border: rgba(255,255,255,0.06); --radius: 16px;
```

Buatkan `app/page.js` dan SEMUA CSS di `app/globals.css` secara LENGKAP. Jangan potong kode.

=== END PROMPT 2 ===


###############################################################
PROMPT 3 — LOGIN + AUTH
###############################################################

=== START PROMPT 3 ===

Lanjut. Buatkan halaman login admin + auth system.

### File 1: `app/login/page.js` ("use client")

Referensi desain dari login asli saya — layout split 2 kolom:

**Kiri:** gradient #e91e8c → #c4176f → #6c63ff, logo kotak (icon spa), "TmDash", "Nail & Beauty Studio", "Sistem Kasir & Manajemen Studio", decorative circles

**Kanan:** bg #16213e, form center max-w 340px:
- "Selamat Datang" + "Silakan masuk ke akun admin Anda"
- Error message (hidden default)
- Input Email (icon fa-user) + Password (icon fa-lock + toggle eye)
- Tombol "Masuk" gradient pink full width
- Footer "Default: admin@tmdash.id / admin123"

**Logic:**
```javascript
// Ganti dari localStorage ke Supabase Auth:
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) { showError('Email atau password salah!'); }
else { router.push('/dashboard'); }
```

Mobile: 2 kolom jadi stack vertical.

### File 2: Update `middleware.js` jika perlu

### File 3: `app/auth/callback/route.js` (sudah dari prompt 1, update jika perlu)

Tambahkan CSS login ke globals.css. Kode LENGKAP.

=== END PROMPT 3 ===


###############################################################
PROMPT 4 — DASHBOARD LAYOUT + SIDEBAR + HOME
###############################################################

=== START PROMPT 4 ===

Lanjut. Buatkan dashboard layout, sidebar, dan halaman home.

### File 1: `app/dashboard/layout.js`
- Server component, cek auth, ambil profile, hitung pending bookings
- Render Sidebar + topbar (judul halaman + tanggal hari ini) + {children}

### File 2: `components/Sidebar.jsx` ("use client")

Referensi dari kode asli:
```html
<!-- Sidebar asli -->
<aside class="sidebar">
  <div class="sidebar-brand">TmDash - Nail & Beauty Studio</div>
  <nav>
    <div class="nav-item" data-page="dashboard">Dashboard</div>
    <div class="nav-item" data-page="pos">Kasir / POS</div>
    <div class="nav-item" data-page="services">Layanan</div>
    <div class="nav-item" data-page="transactions">Riwayat Transaksi</div>
    <div class="nav-item" data-page="bookings">Booking <span class="nav-badge">1</span></div>
  </nav>
  <div class="sidebar-footer">
    <div class="user-avatar">A</div> Admin / Administrator
    <button class="btn-logout">Keluar</button>
  </div>
</aside>
```

Styling: width 260px, fixed, bg #0f0f23, nav active = gradient pink + shadow, badge merah.
Gunakan `usePathname()` untuk highlight active. Logout: `supabase.auth.signOut()`.

### File 3: `app/dashboard/page.js` ("use client")

4 stat cards + tabel 5 transaksi terakhir. Referensi logic asli:
```javascript
const todayRevenue = todayTx.reduce((sum, t) => sum + t.total, 0); // SUM transactions today
const todayCount = todayTx.length; // COUNT transactions today
const totalServices = getServices().length; // COUNT services
const monthRevenue = monthTx.reduce((sum, t) => sum + t.total, 0); // SUM this month
```

Ganti semua ke query Supabase. Kode LENGKAP.

=== END PROMPT 4 ===


###############################################################
PROMPT 5 — KASIR / POS + STRUK
###############################################################

=== START PROMPT 5 ===

Lanjut. Buatkan halaman POS (kasir) dan komponen struk.

### File 1: `app/dashboard/pos/page.js` ("use client")

Layout 2 kolom (grid 1fr 380px). Referensi logic asli:

**Kolom kiri — Pilih Layanan:**
- Search + filter kategori (Semua/Nail Art/Nail Care/Beauty/Eyelash/Waxing/Paket)
- Grid card layanan dari Supabase: emoji, nama, harga
- Klik card = addToCart

**Kolom kanan — Keranjang (React state, BUKAN database):**
```javascript
// Logic cart asli:
function addToCart(serviceId) {
    const existing = cart.find(item => item.id === serviceId);
    if (existing) { existing.qty++; }
    else { cart.push({ id: service.id, name: service.name, price: service.price, qty: 1 }); }
}
function updateQty(serviceId, delta) {
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== serviceId);
}
```

**Proses Bayar:**
```javascript
// Logic asli, ganti ke Supabase insert:
const transaction = {
    id: 'TRX-' + generateId().toUpperCase(),
    subtotal, total: subtotal,
    cashier_name: user.name, cashier_id: user.id
};
// INSERT transactions + INSERT transaction_items untuk setiap cart item
// Clear cart, tampilkan Receipt
```

### File 2: `components/Receipt.jsx` ("use client")

Struk putih (bg white, teks #333):
```
TmDash Nail & Beauty Studio
Jl. Contoh Alamat No. 123 | Telp: 0812-3456-7890
--- (dashed line) ---
No: TRX-xxx | Tanggal: ... | Kasir: ...
--- ---
Layanan | Qty | Subtotal (tabel)
--- ---
TOTAL: Rp xxx.xxx (bold besar)
Terima kasih atas kunjungan Anda!
```
Tombol Tutup + Cetak (window.print). Kode LENGKAP.

=== END PROMPT 5 ===


###############################################################
PROMPT 6 — CRUD LAYANAN + RIWAYAT TRANSAKSI
###############################################################

=== START PROMPT 6 ===

Lanjut. Buatkan halaman kelola layanan dan riwayat transaksi.

### File 1: `app/dashboard/services/page.js` ("use client")

Referensi logic asli:
```javascript
// CRUD Services — ganti ke Supabase
// Tambah: supabase.from('services').insert({name, category, price, emoji})
// Edit: supabase.from('services').update({name, category, price, emoji}).eq('id', id)
// Hapus: confirm('Hapus?') → supabase.from('services').delete().eq('id', id)
```

Tabel: emoji+nama, kategori badge hijau, harga bold, tombol edit biru + hapus merah.
Modal form: nama, kategori dropdown (Nail Care/Nail Art/Beauty/Eyelash/Waxing/Paket), harga, emoji.

### File 2: `app/dashboard/transactions/page.js` ("use client")

Tabel: no transaksi, tanggal, layanan (join items), total, tombol lihat.
Query Supabase: transactions order desc, untuk setiap row ambil transaction_items.
Klik lihat → tampilkan Receipt modal (reuse komponen).

Kode LENGKAP.

=== END PROMPT 6 ===


###############################################################
PROMPT 7 — KELOLA BOOKING
###############################################################

=== START PROMPT 7 ===

Lanjut. Buatkan halaman kelola booking admin.

### File: `app/dashboard/bookings/page.js` ("use client")

Referensi logic asli:
```javascript
// Stats
const pending = bookings.filter(b => b.status === 'pending').length;
const confirmed = bookings.filter(b => b.status === 'confirmed').length;
const todayBookings = bookings.filter(b => b.date === today).length;

// Update status — ganti ke Supabase:
// supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)

// Status badges:
// pending → kuning "Menunggu" + tombol Konfirmasi(hijau) & Batalkan(merah)
// confirmed → hijau "Dikonfirmasi" + tombol Selesai(biru)
// done → hijau "Selesai"
// cancelled → merah "Dibatalkan"
```

3 stat cards + tabel booking + link "Lihat Halaman Promo". Kode LENGKAP.

=== END PROMPT 7 ===


###############################################################
PROMPT 8 — DEPLOY KE VERCEL
###############################################################

=== START PROMPT 8 ===

Lanjut. Bantu saya deploy ke Vercel. Akun Vercel sudah ada, project belum.

### Step 1: Buat file `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```
(dari Supabase Settings > API)

### Step 2: Test lokal dulu
```bash
npm install
npm run dev
# Buka http://localhost:3000 → test promo page, booking, login, dashboard, POS
```

### Step 3: Push ke GitHub
```bash
# Pastikan .gitignore ada (node_modules, .env.local, .next)
git init
git add .
git commit -m "feat: TmDash Nail & Beauty Studio"
# Buat repo baru di github.com/new → nama: tmdash-nail
git remote add origin https://github.com/USERNAMESAYA/tmdash-nail.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy di Vercel
1. Buka https://vercel.com/dashboard → **Add New > Project**
2. Import repo **tmdash-nail**
3. Framework: Next.js (auto-detect)
4. **Environment Variables** — tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = (paste URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (paste anon key)
5. Klik **Deploy** → tunggu ~2 menit
6. Dapat URL: `https://tmdash-nail.vercel.app`

### Step 5: Setting Supabase URL
1. Supabase → **Authentication > URL Configuration**
2. Site URL: `https://tmdash-nail.vercel.app`
3. Redirect URLs tambah: `https://tmdash-nail.vercel.app/**` dan `http://localhost:3000/**`

### Step 6: Test checklist
```
[ ] Halaman promo tampil + layanan muncul dari database
[ ] Form booking → submit → data masuk ke Supabase
[ ] Login: admin@tmdash.id / admin123
[ ] Dashboard: stats tampil
[ ] POS: pilih layanan → cart → bayar → struk
[ ] Layanan: tambah / edit / hapus
[ ] Transaksi: riwayat + detail struk
[ ] Booking: konfirmasi / batalkan / selesai
[ ] Logout → redirect login
[ ] Responsive mobile
```

### Troubleshooting:
| Masalah | Solusi |
|---------|--------|
| Build error | Cek env variables di Vercel Settings > Env Vars → re-deploy |
| Login gagal | Pastikan user admin ada + Auto Confirm di Supabase Auth |
| Data kosong | SQL schema + seed belum di-run di SQL Editor |
| Promo page kosong | RLS: services SELECT harus allow anon |
| Booking gagal dari publik | RLS: bookings INSERT harus allow anon |
| Redirect loop | Site URL di Supabase Auth harus match URL Vercel |

### Update kode setelah deploy:
```bash
git add . && git commit -m "update: ..." && git push
# Vercel auto re-deploy
```

Buatkan juga file `.gitignore` dan `vercel.json` (jika diperlukan). Kode LENGKAP.

=== END PROMPT 8 ===


###############################################################
CATATAN: Tempel di akhir SETIAP prompt jika Claude mulai pakai Tailwind atau potong kode
###############################################################

ATURAN (WAJIB):
- Next.js 14+ App Router. BUKAN Pages Router.
- @supabase/ssr untuk client. BUKAN @supabase/auth-helpers-nextjs (deprecated).
- JANGAN pakai Tailwind CSS. Custom CSS di globals.css.
- Font: Poppins Google Fonts. Icons: Font Awesome 6 CDN.
- Bahasa UI: Indonesia. Mata uang: Rupiah (Rp). Tanggal: format Indonesia.
- Dark theme: bg #0f0f1a, primary #e91e8c, secondary #6c63ff.
- KODE HARUS LENGKAP. Jangan tulis "// ... rest of code" atau "// sama seperti sebelumnya".
