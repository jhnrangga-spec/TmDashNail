# ============================================================
# PROMPT BUILD NEXT.JS + DEPLOY VERCEL
# TmDash Nail & Beauty Studio
# ============================================================
#
# SUPABASE SUDAH SELESAI:
# ✅ Project tmdash-nail dibuat
# ✅ SQL schema + seed 20 layanan sudah di-run
# ✅ User admin (admin@tmdash.id / admin123) sudah dibuat
# ✅ API keys sudah dicatat
#
# TINGGAL: Build Next.js → Push GitHub → Deploy Vercel
#
# CARA PAKAI:
# 1. Buka claude.ai → conversation baru
# 2. Copy PROMPT 1 → paste → tunggu selesai
# 3. Bilang "lanjut" → sampai PROMPT 4
# 4. Total cuma 4 prompt
#
# ============================================================


###############################################################
PROMPT 1 — FONDASI + HALAMAN PROMO + LOGIN
(copy SEMUA dari === START === sampai === END ===)
###############################################################

=== START PROMPT 1 ===

Buatkan project Next.js 14 (App Router) lengkap untuk "TmDash Nail & Beauty Studio" — sistem kasir/POS + halaman promo nail & beauty studio.

**Supabase sudah siap** (project, database, tabel, seed data, user admin semua sudah ada). Saya hanya perlu kode Next.js-nya.

## Database yang sudah ada di Supabase:

**Tabel `services`**: id(bigint), name, category, price(int), emoji, created_at
**Tabel `transactions`**: id(text PK, "TRX-xxx"), subtotal(int), total(int), cashier_name, cashier_id(uuid), created_at
**Tabel `transaction_items`**: id(bigint), transaction_id(text FK), service_name, price(int), qty(int), subtotal(int)
**Tabel `bookings`**: id(text PK, "BK-xxx"), name, phone, service_id(bigint FK), service_name, service_price(int), booking_date(date), booking_time(text), notes, status(text default 'pending'), created_at
**Tabel `profiles`**: id(uuid FK auth.users), full_name, role, created_at

RLS: services SELECT publik, bookings INSERT publik, sisanya authenticated only.

## Struktur project yang saya mau:

```
tmdash-nail/
├── app/
│   ├── layout.js              # Root layout (Poppins font, FA6, metadata)
│   ├── page.js                # Halaman promo publik (landing page)
│   ├── globals.css            # SEMUA styling (dark theme)
│   ├── login/page.js          # Login admin
│   ├── auth/callback/route.js # Auth callback
│   ├── dashboard/
│   │   ├── layout.js          # Dashboard layout + sidebar + auth guard
│   │   ├── page.js            # Dashboard home (stats)
│   │   ├── pos/page.js        # Kasir/POS
│   │   ├── services/page.js   # CRUD layanan
│   │   ├── transactions/page.js # Riwayat transaksi
│   │   └── bookings/page.js   # Kelola booking
├── components/
│   ├── Sidebar.jsx
│   └── Receipt.jsx
├── lib/
│   ├── supabase.js            # Browser client
│   ├── supabase-server.js     # Server client
│   └── utils.js               # Helper functions
├── middleware.js
├── package.json
├── next.config.js
├── jsconfig.json
├── .env.local.example
└── .gitignore
```

## Untuk PROMPT 1 ini, buatkan file-file berikut:

### 1. `package.json`
Dependencies: next, react, react-dom, @supabase/supabase-js, @supabase/ssr

### 2. `next.config.js`

### 3. `jsconfig.json` (alias @/ → root)

### 4. `.env.local.example`
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. `.gitignore`
node_modules, .next, .env.local, dll

### 6. `lib/supabase.js` — createBrowserClient dari @supabase/ssr

### 7. `lib/supabase-server.js` — createServerClient (pakai cookies dari next/headers)

### 8. `lib/utils.js`
```javascript
export function formatRupiah(num) { return 'Rp ' + num.toLocaleString('id-ID'); }
export function formatDate(dateStr) { return new Date(dateStr).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }); }
export function formatTime(dateStr) { return new Date(dateStr).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }); }
export function formatDateTime(dateStr) { return formatDate(dateStr) + ' ' + formatTime(dateStr); }
export function generateTrxId() { return 'TRX-' + (Date.now().toString(36) + Math.random().toString(36).substr(2,5)).toUpperCase(); }
export function generateBookingId() { return 'BK-' + (Date.now().toString(36) + Math.random().toString(36).substr(2,3)).toUpperCase(); }
```

### 9. `middleware.js`
- /dashboard/* → cek auth, redirect ke /login jika belum login
- /login → redirect ke /dashboard jika sudah login

### 10. `app/auth/callback/route.js` — handle code exchange

### 11. `app/layout.js`
- html lang="id"
- Google Fonts Poppins (link di head)
- Font Awesome 6 CDN (link di head)
- metadata: title "TmDash Nail & Beauty Studio"
- import globals.css

### 12. `app/login/page.js` ("use client")

Layout split 2 kolom, center di halaman:

**Kiri**: gradient #e91e8c → #c4176f → #6c63ff, logo kotak icon fa-spa, "TmDash", "Nail & Beauty Studio", "Sistem Kasir & Manajemen Studio", decorative circles

**Kanan**: bg #16213e, max-w 340px center
- "Selamat Datang" + "Silakan masuk ke akun admin Anda"
- Error message (hidden)
- Input Email + Password (toggle eye)
- Tombol "Masuk" gradient pink
- "Default: admin@tmdash.id / admin123"

Login: `supabase.auth.signInWithPassword({email, password})` → router.push('/dashboard')

### 13. `app/page.js` ("use client") — HALAMAN PROMO PUBLIK

Halaman landing satu page lengkap:

**Navbar** fixed: logo TmDash + Beranda/Layanan/Paket/Galeri/Booking/Kontak, mobile hamburger

**Hero**: "Tampil Cantik Mulai dari Ujung Jari" (gradient text), 2 tombol (Buat Janji + Lihat Layanan), stats 500+/20+/5+

**Kenapa Kami** (bg #141425): 4 card - Produk Premium, Terapis Berpengalaman, Higienis & Steril, Pelayanan Terbaik

**Layanan** (bg #0f0f1a): fetch Supabase services WHERE category!='Paket', filter pills (Semua/Nail Art/Nail Care/Beauty/Eyelash/Waxing), grid card emoji+nama+harga+tombol booking

**Paket** (bg #141425): fetch WHERE category='Paket', 3 card:
- Mani-Pedi Rp140rb: Manicure lengkap, Pedicure lengkap, Nail polish pilihan, Hand & foot massage
- Bridal Nail Rp350rb (BEST SELLER ribbon): Gel manicure premium, Nail art custom design, Pedicure lengkap, Nail extension opsional, Free 1x touch up
- Beauty Complete Rp500rb: Gel mani&pedi, Nail art medium, Eyelash extension natural, Facial glowing, Free aftercare kit

**Galeri**: 6 placeholder gradient card (Nail Art Floral, Gel Extension, Eyelash Volume, Facial Glowing, Chrome Nails, Bridal Set)

**Booking**: 2 kolom — kiri info (benefit + jam operasional Sen-Sab 09-21, Ming 10-20 + lokasi), kanan form (nama, WA, layanan dropdown grouped by category dari Supabase, tanggal min besok, jam 09:00-20:00 per 30min, catatan) → INSERT Supabase bookings → modal sukses

**Testimoni**: 3 card (Rina S, Dinda A, Maya P) bintang 5

**Footer**: 4 kolom (brand+sosmed, menu, layanan, kontak), copyright 2026

### 14. `app/globals.css` — SEMUA STYLING

Dark theme lengkap untuk SEMUA halaman (promo + login + dashboard + POS):

```css
:root {
  --primary: #e91e8c;
  --primary-light: #f06cb5;
  --primary-dark: #c4176f;
  --secondary: #6c63ff;
  --accent: #ff6b9d;
  --bg-dark: #0f0f1a;
  --bg-section: #141425;
  --bg-card: #1a1a30;
  --bg-sidebar: #0f0f23;
  --text-light: #ffffff;
  --text-muted: #9a9ab0;
  --success: #00c897;
  --warning: #ffb800;
  --danger: #ff4757;
  --border: rgba(255,255,255,0.06);
  --radius: 16px;
}
```

Sertakan styling untuk:
- Reset + body + scrollbar
- Navbar (fixed, scrolled blur, mobile toggle)
- Hero (gradient bg, gradient text, stats)
- Feature cards, service cards, package cards
- Gallery grid, testimonial cards
- Booking form + modal sukses
- Footer
- Login page (split layout, decorative circles)
- Sidebar (260px fixed, nav items active gradient, badge, mobile slide)
- Topbar, page content
- Stat cards, table container, tables
- Buttons (primary, secondary, success, danger, sm, lg, full)
- Badges (success, warning, danger)
- Modals (overlay blur, card)
- Form inputs
- POS layout (2 kolom, service grid, cart)
- Receipt (white bg, print)
- Responsive breakpoints (1024, 768, 480)
- Print media query

BERIKAN SEMUA KODE LENGKAP. Jangan potong. Jangan tulis "// ... rest". Ini prompt paling besar, file berikutnya lebih kecil.

## ATURAN WAJIB:
- Next.js 14 App Router, BUKAN Pages Router
- @supabase/ssr (BUKAN @supabase/auth-helpers-nextjs)
- JANGAN Tailwind CSS, pakai custom CSS globals.css
- Font Poppins + Font Awesome 6 via CDN
- Bahasa Indonesia, Rupiah, dark theme
- KODE LENGKAP, jangan potong

Saya bilang "lanjut" untuk prompt berikutnya.

=== END PROMPT 1 ===


###############################################################
PROMPT 2 — DASHBOARD LAYOUT + SIDEBAR + HOME + POS
(copy SEMUA dari === START === sampai === END ===)
###############################################################

=== START PROMPT 2 ===

Lanjut. Buatkan dashboard layout, sidebar, home, dan POS.

### File 1: `app/dashboard/layout.js`
- Server component
- Cek auth via Supabase server client → redirect('/login') jika tidak login
- Ambil profile dari tabel profiles
- Hitung pending bookings count
- Render: Sidebar (pass user data + pending count) + topbar + {children}
- Topbar: judul halaman dinamis + tanggal hari ini format Indonesia

### File 2: `components/Sidebar.jsx` ("use client")

Props: user {fullName, role}, pendingBookings, currentPath

- Brand: icon fa-spa + "TmDash" + "Nail & Beauty Studio"
- Nav items (gunakan `usePathname()` untuk active):
  - /dashboard → fa-home Dashboard
  - /dashboard/pos → fa-cash-register Kasir / POS
  - /dashboard/services → fa-concierge-bell Layanan
  - /dashboard/transactions → fa-receipt Riwayat Transaksi
  - /dashboard/bookings → fa-calendar-check Booking + badge merah pending
- Footer: avatar initial + nama + role + tombol Keluar (supabase.auth.signOut → router.push /login)
- Mobile: hamburger toggle sidebar

### File 3: `app/dashboard/page.js` ("use client")

4 stat cards dari Supabase:
1. Pendapatan Hari Ini → SUM transactions.total WHERE created_at today
2. Transaksi Hari Ini → COUNT transactions today
3. Total Layanan → COUNT services
4. Pendapatan Bulan Ini → SUM transactions.total this month

Tabel 5 transaksi terakhir:
- Kolom: No Transaksi, Tanggal, Layanan (join items), Total, Status (badge "Lunas")
- Tombol "Transaksi Baru" → link /dashboard/pos

### File 4: `app/dashboard/pos/page.js` ("use client")

**Layout grid 2 kolom (1fr 380px):**

Kiri — Pilih Layanan:
- Search box + filter kategori pills (Semua/Nail Art/Nail Care/Beauty/Eyelash/Waxing/Paket)
- Grid card layanan dari Supabase (emoji, nama, harga)
- Klik card = tambah ke cart

Kanan — Keranjang (React useState):
- List item: nama, harga x qty = subtotal, tombol -/qty/+
- Kosong: "Keranjang kosong"
- Subtotal + Total + tombol "Bayar"

Proses Bayar:
1. Generate TRX id
2. INSERT transactions (id, subtotal, total, cashier_name, cashier_id)
3. INSERT transaction_items per cart item
4. Clear cart, tampilkan Receipt modal

### File 5: `components/Receipt.jsx` ("use client")

Modal struk (bg putih, teks #333):
- "TmDash Nail & Beauty Studio", alamat, telp
- No, Tanggal, Kasir
- Tabel: Layanan | Qty | Subtotal
- TOTAL bold
- "Terima kasih atas kunjungan Anda!"
- Tombol Tutup + Cetak (window.print)

## ATURAN: Next.js 14 App Router, @supabase/ssr, custom CSS (sudah di globals.css), KODE LENGKAP jangan potong.

=== END PROMPT 2 ===


###############################################################
PROMPT 3 — LAYANAN + TRANSAKSI + BOOKING
(copy SEMUA dari === START === sampai === END ===)
###############################################################

=== START PROMPT 3 ===

Lanjut. Buatkan halaman layanan, transaksi, dan booking.

### File 1: `app/dashboard/services/page.js` ("use client")

Tabel layanan dari Supabase:
- Kolom: Nama (emoji + nama), Kategori (badge hijau), Harga (bold Rp), Aksi (edit biru + hapus merah)
- Tombol "Tambah Layanan" (pink)
- Modal form: nama, kategori (select: Nail Care/Nail Art/Beauty/Eyelash/Waxing/Paket), harga, emoji
- Tambah: supabase.from('services').insert(...)
- Edit: supabase.from('services').update(...).eq('id', id)
- Hapus: confirm → supabase.from('services').delete().eq('id', id)
- Refresh data setelah operasi

### File 2: `app/dashboard/transactions/page.js` ("use client")

Tabel transaksi:
- Kolom: No Transaksi, Tanggal, Layanan (join items), Total, Aksi (tombol lihat)
- Fetch transactions order desc + transaction_items
- Klik lihat → fetch detail → tampilkan Receipt modal (reuse komponen)
- Kosong: "Belum ada transaksi"

### File 3: `app/dashboard/bookings/page.js` ("use client")

3 stat cards:
1. Menunggu Konfirmasi → COUNT status='pending'
2. Dikonfirmasi → COUNT status='confirmed'
3. Booking Hari Ini → COUNT booking_date = today

Tabel booking:
- Kolom: No Booking, Nama, Layanan + harga, Tanggal & Jam, WhatsApp, Status (badge), Aksi
- Badges: pending=kuning "Menunggu", confirmed=hijau "Dikonfirmasi", done=hijau "Selesai", cancelled=merah "Dibatalkan"
- Aksi: pending → Konfirmasi(hijau) + Batalkan(merah), confirmed → Selesai(biru)
- Update: supabase.from('bookings').update({status}).eq('id', id) → refresh data
- Link "Lihat Halaman Promo" → / target blank

## ATURAN: Next.js 14 App Router, @supabase/ssr, custom CSS (sudah di globals.css), KODE LENGKAP jangan potong.

=== END PROMPT 3 ===


###############################################################
PROMPT 4 — TEST + DEPLOY VERCEL
(copy SEMUA dari === START === sampai === END ===)
###############################################################

=== START PROMPT 4 ===

Lanjut. Sekarang bantu saya test dan deploy.

Saya sudah punya akun Vercel. Supabase sudah siap (project tmdash-nail, database, user admin).

### Step 1: Buat `.env.local`
Saya sudah punya API keys dari Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=<url saya>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key saya>
```

### Step 2: Test lokal
Berikan perintah terminal:
```bash
npm install
npm run dev
```
Dan checklist test apa saja yang harus saya cek.

### Step 3: Push ke GitHub
Berikan perintah git lengkap (init, add, commit, remote, push). Saya akan buat repo baru bernama `tmdash-nail` di github.com/new.

### Step 4: Deploy di Vercel
Berikan panduan langkah-langkah:
1. vercel.com/dashboard → Add New → Project
2. Import repo tmdash-nail
3. Set env variables
4. Deploy
5. Dapat URL

### Step 5: Setting Supabase URL
- Authentication → URL Configuration → Site URL + Redirect URLs

### Step 6: Checklist test production
```
[ ] Halaman promo tampil + layanan dari DB
[ ] Form booking → submit → data masuk Supabase
[ ] Login admin@tmdash.id / admin123
[ ] Dashboard stats
[ ] POS → bayar → struk → transaksi tersimpan
[ ] CRUD layanan
[ ] Riwayat transaksi + detail
[ ] Kelola booking (konfirmasi/batal/selesai)
[ ] Logout
[ ] Mobile responsive
```

### Troubleshooting
Berikan tabel masalah umum + solusi (build error, login gagal, data kosong, RLS error, redirect loop, dll).

### Jika ada error build
Tolong review SEMUA file yang sudah dibuat dan pastikan:
- Semua import benar
- Tidak ada typo
- Tidak ada missing component
- CSS class names konsisten
- Supabase queries benar

Berikan fix jika ada yang perlu diperbaiki.

=== END PROMPT 4 ===


###############################################################
CATATAN DARURAT — Tempel jika Claude mulai salah
###############################################################

ATURAN WAJIB:
- Next.js 14+ App Router (BUKAN Pages Router, BUKAN src/ directory)
- @supabase/ssr untuk auth client (BUKAN @supabase/auth-helpers-nextjs yang deprecated)
- JANGAN pakai Tailwind CSS. Semua styling custom CSS di app/globals.css
- Font: Poppins via Google Fonts CDN link di head
- Icons: Font Awesome 6 via CDN link di head
- Bahasa UI: Indonesia. Mata uang: Rupiah (Rp). Format tanggal: Indonesia
- Dark theme: bg #0f0f1a, primary #e91e8c, secondary #6c63ff
- KODE HARUS 100% LENGKAP. JANGAN tulis "// ... rest of code" atau "// similar to above"
- Setiap file harus bisa langsung copy-paste tanpa modifikasi
