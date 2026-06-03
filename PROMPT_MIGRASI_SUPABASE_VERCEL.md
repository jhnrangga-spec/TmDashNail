# PROMPT UNTUK CLAUDE BROWSER
# Migrasi TmDash Nail & Beauty Studio ke Next.js + Supabase + Vercel
# ===================================================================
# Copy-paste SELURUH isi file ini ke Claude di browser (claude.ai)
# ===================================================================

---

## PROMPT 1: Setup Project & Supabase Schema

Saya punya aplikasi web "TmDash Nail & Beauty Studio" (sistem kasir/POS + halaman promo untuk nail & beauty studio). Saat ini masih pakai vanilla HTML/CSS/JS dengan localStorage. Saya mau migrasi ke **Next.js + Supabase + deploy di Vercel**.

### Apa yang aplikasi ini punya sekarang:

**1. Halaman Login Admin** (`index.html`)
- Login dengan username/password (default: admin / admin123)
- Session-based auth pakai sessionStorage

**2. Dashboard Admin** (`dashboard.html`) dengan fitur:
- **Dashboard**: stat card (pendapatan hari ini, transaksi hari ini, total layanan, pendapatan bulan), tabel transaksi terakhir
- **Kasir/POS**: grid layanan dengan filter kategori + search, keranjang belanja, proses pembayaran, cetak struk
- **Manajemen Layanan**: CRUD layanan (nama, kategori, harga, emoji)
- **Riwayat Transaksi**: list semua transaksi, lihat detail struk
- **Booking**: kelola booking masuk (konfirmasi/batalkan/selesai), stat pending/confirmed

**3. Halaman Promo Publik** (`promo.html`)
- Landing page dengan hero, katalog layanan, paket spesial, galeri, testimoni
- Form booking online (nama, whatsapp, layanan, tanggal, jam, catatan)
- Footer dengan kontak & sosial media

### Data yang disimpan:

**Services** (20 layanan default):
```
id, name, category, price, emoji
Kategori: Nail Art, Nail Care, Beauty, Eyelash, Waxing, Paket
```

**Transactions**:
```
id (TRX-xxx), date, items (array: name, price, qty, subtotal), subtotal, total, cashier
```

**Bookings**:
```
id (BK-xxx), name, phone, serviceId, serviceName, servicePrice, date, time, notes, status (pending/confirmed/done/cancelled), createdAt
```

**Users**:
```
username, password, name, role
```

### Yang saya mau:

1. **Buatkan project Next.js (App Router)** dengan struktur yang rapi
2. **Supabase** untuk database & authentication:
   - Buat SQL schema lengkap untuk semua tabel (services, transactions, transaction_items, bookings, profiles)
   - Gunakan Supabase Auth untuk login admin (email/password)
   - Row Level Security (RLS) policies:
     - Services: public bisa read, admin bisa CRUD
     - Bookings: public bisa insert (buat booking), admin bisa read/update
     - Transactions: hanya admin
   - Seed data untuk 20 layanan default
3. **Pertahankan semua desain CSS** yang sudah ada (dark theme, pink/magenta accent, responsive)
4. **Semua fitur harus sama** seperti versi sebelumnya, tapi data dari Supabase

### Struktur yang saya harapkan:

```
tmdash-nail/
├── app/
│   ├── layout.js              # Root layout
│   ├── page.js                # Landing/promo page (publik)
│   ├── globals.css            # Global styles
│   ├── login/
│   │   └── page.js            # Admin login
│   ├── dashboard/
│   │   ├── layout.js          # Dashboard layout (sidebar, topbar, auth guard)
│   │   ├── page.js            # Dashboard home (stats)
│   │   ├── pos/
│   │   │   └── page.js        # Kasir/POS
│   │   ├── services/
│   │   │   └── page.js        # Kelola layanan
│   │   ├── transactions/
│   │   │   └── page.js        # Riwayat transaksi
│   │   └── bookings/
│   │       └── page.js        # Kelola booking
│   └── api/                   # API routes jika perlu
├── components/
│   ├── Sidebar.jsx
│   ├── ServiceCard.jsx
│   ├── CartItem.jsx
│   ├── Receipt.jsx
│   ├── BookingForm.jsx
│   └── ...
├── lib/
│   ├── supabase.js            # Supabase client (browser)
│   ├── supabase-server.js     # Supabase client (server)
│   └── utils.js               # formatRupiah, formatDate, dll
├── supabase/
│   └── schema.sql             # SQL lengkap: tabel, RLS, seed data
├── package.json
├── next.config.js
├── .env.local.example
└── vercel.json (jika perlu)
```

### Tolong mulai dari:
1. SQL schema lengkap (`supabase/schema.sql`) termasuk seed 20 layanan
2. Setup project Next.js (`package.json`, config)
3. Supabase client helpers (`lib/`)
4. Utility functions (`lib/utils.js`)

Buat step by step, saya akan bilang "lanjut" untuk file-file berikutnya.

---

## PROMPT 2: Halaman Publik (Landing Page + Booking)

Lanjut. Sekarang buatkan:

1. **`app/page.js`** - Halaman landing/promo publik dengan:
   - Navbar (Beranda, Layanan, Paket, Galeri, Booking, Kontak)
   - Hero section: "Tampil Cantik Mulai dari Ujung Jari", tombol Buat Janji & Lihat Layanan, stats (500+ pelanggan, 20+ layanan, 5+ tahun)
   - Section "Kenapa Kami": Produk Premium, Terapis Berpengalaman, Higienis & Steril, Pelayanan Terbaik
   - Katalog layanan dari Supabase, filter per kategori (Nail Art, Nail Care, Beauty, Eyelash, Waxing) - TANPA paket
   - Paket spesial (kategori Paket) dengan card detail & deskripsi
   - Galeri placeholder (6 item gradient + icon)
   - Form booking (nama, whatsapp, pilih layanan dari DB, tanggal, jam, catatan)
   - Testimoni (3 review statis)
   - Footer (kontak, sosmed, jam operasional)
   - Modal sukses setelah booking berhasil

2. **`app/globals.css`** - Semua styling untuk halaman promo, pertahankan desain dark theme yang sudah ada

Warna utama:
- Primary: #e91e8c (pink)
- Secondary: #6c63ff (ungu)
- Background: #0f0f1a, #141425, #1a1a30
- Text: #ffffff, #9a9ab0
- Success: #00c897

---

## PROMPT 3: Login & Auth

Lanjut. Buatkan halaman login admin:

1. **`app/login/page.js`** - Halaman login dengan:
   - Split layout: kiri gradient pink-ungu dengan branding TmDash, kanan form login
   - Login pakai Supabase Auth (email + password)
   - Toggle show/hide password
   - Error message jika salah
   - Redirect ke /dashboard setelah login berhasil
   - Styling sama persis dengan desain sebelumnya (dark theme)

2. **`components/AuthProvider.jsx`** atau middleware untuk auth guard di /dashboard/*

Default admin: buat instruksi untuk create user di Supabase Dashboard (Authentication > Users > Add User) dengan email: admin@tmdash.id, password: admin123

---

## PROMPT 4: Dashboard Layout + Home

Lanjut. Buatkan dashboard layout dan halaman utama:

1. **`app/dashboard/layout.js`** - Layout dashboard dengan:
   - Auth guard (redirect ke /login jika belum login)
   - Sidebar: logo TmDash, nav items (Dashboard, Kasir/POS, Layanan, Riwayat Transaksi, Booking dengan badge pending count)
   - User info di sidebar footer (nama, role, tombol Keluar)
   - Topbar: judul halaman, tanggal hari ini
   - Mobile responsive (hamburger menu)

2. **`components/Sidebar.jsx`** - Komponen sidebar

3. **`app/dashboard/page.js`** - Dashboard home:
   - 4 stat card: Pendapatan Hari Ini, Transaksi Hari Ini, Total Layanan, Pendapatan Bulan Ini
   - Tabel 5 transaksi terakhir
   - Data real-time dari Supabase

---

## PROMPT 5: Kasir / POS

Lanjut. Buatkan halaman kasir/POS:

1. **`app/dashboard/pos/page.js`** - Halaman POS dengan:
   - Layout 2 kolom: kiri = grid layanan, kanan = keranjang
   - Grid layanan: card dengan emoji, nama, harga. Filter kategori (Semua, Nail Art, Nail Care, Beauty, Eyelash, Waxing, Paket). Search box
   - Keranjang: list item, +/- qty, tombol kosongkan, subtotal, total, tombol Bayar
   - Layanan diambil dari Supabase
   - Klik card = tambah ke keranjang (state lokal/React state)
   - Proses bayar = simpan transaksi ke Supabase (tabel transactions + transaction_items)
   - Setelah bayar = tampilkan modal struk/receipt

2. **`components/Receipt.jsx`** - Komponen struk:
   - Header: TmDash Nail & Beauty Studio, alamat, telp
   - No transaksi, tanggal, kasir
   - List item: layanan, qty, subtotal
   - Total
   - Footer: "Terima kasih atas kunjungan Anda!"
   - Tombol cetak (window.print)

---

## PROMPT 6: Layanan & Transaksi

Lanjut. Buatkan:

1. **`app/dashboard/services/page.js`** - Kelola layanan:
   - Tabel: nama (emoji + nama), kategori (badge), harga, tombol edit & hapus
   - Tombol "Tambah Layanan"
   - Modal form: nama, kategori (dropdown), harga, emoji
   - CRUD ke Supabase (insert, update, delete)
   - Konfirmasi sebelum hapus

2. **`app/dashboard/transactions/page.js`** - Riwayat transaksi:
   - Tabel: no transaksi, tanggal, layanan, total, tombol lihat detail
   - Klik lihat = modal struk (pakai komponen Receipt)
   - Data dari Supabase dengan join transaction_items

---

## PROMPT 7: Booking Management

Lanjut. Buatkan:

1. **`app/dashboard/bookings/page.js`** - Kelola booking:
   - 3 stat card: Menunggu Konfirmasi, Dikonfirmasi, Booking Hari Ini
   - Tabel: no booking, nama, layanan + harga, tanggal & jam, whatsapp, status (badge warna), tombol aksi
   - Status pending: tombol Konfirmasi (hijau) & Batalkan (merah)
   - Status confirmed: tombol Selesai
   - Update status ke Supabase
   - Link "Lihat Halaman Promo"

---

## PROMPT 8: Deploy ke Vercel

Lanjut. Sekarang bantu saya deploy ke Vercel:

1. **Environment variables** yang perlu di-set di Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

2. **Step-by-step deploy**:
   - Push repo ke GitHub
   - Connect ke Vercel
   - Set env variables
   - Deploy

3. **File konfigurasi** yang diperlukan:
   - `next.config.js` (jika perlu setting khusus)
   - `.env.local.example` (template env)
   - `vercel.json` (jika perlu rewrite/redirect)

4. **Checklist sebelum deploy**:
   - Supabase project sudah dibuat
   - SQL schema sudah dijalankan di Supabase SQL Editor
   - User admin sudah dibuat di Supabase Auth
   - Environment variables sudah benar
   - Build berhasil (`npm run build`)

5. Berikan juga **panduan Supabase setup** langkah demi langkah:
   - Buat project baru di supabase.com
   - Copy URL & anon key
   - Jalankan schema.sql di SQL Editor
   - Buat user admin di Authentication
   - Set RLS policies

---

# CATATAN PENTING UNTUK CLAUDE:

- Gunakan Next.js 14+ App Router (bukan Pages Router)
- Gunakan `@supabase/supabase-js` v2 dan `@supabase/ssr`
- Komponen yang perlu interaktivitas pakai `"use client"`
- Server components untuk fetch data awal
- Semua styling inline atau CSS modules (atau bisa pakai globals.css saja supaya simple)
- Bahasa UI: Indonesia
- Mata uang: Rupiah (Rp)
- Format tanggal: Indonesia (dd MMM yyyy)
- Jangan pakai Tailwind CSS, pertahankan custom CSS dark theme yang sudah ada
- Font: Poppins (Google Fonts)
- Icons: Font Awesome 6
