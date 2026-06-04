# Prompt Deploy ke Vercel & Setup Supabase Auth

Copy-paste prompt di bawah ini ke Claude Browser untuk panduan langkah demi langkah.

---

## PROMPT:

Bantu saya deploy aplikasi Next.js ke Vercel dan konfigurasi Supabase Auth. Berikan panduan langkah demi langkah dengan screenshot description yang jelas. Aplikasi saya bernama **TmDash Nail & Beauty Studio**.

### Info Project:
- **Repo GitHub:** `jhnrangga-spec/tmdashnail`
- **Branch:** `claude/cool-clarke-Md3qO`
- **Root Directory:** `nextjs-app`
- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (project name: `tmdash-nailart`)

### Yang perlu dilakukan (berikan panduan detail untuk PEMULA):

---

### BAGIAN 1: Deploy ke Vercel

**Langkah 1 — Buka Vercel**
1. Buka https://vercel.com dan login dengan akun GitHub
2. Jika belum punya akun Vercel, klik "Sign Up" → pilih "Continue with GitHub" → authorize

**Langkah 2 — Import Repository**
1. Di dashboard Vercel, klik tombol **"Add New..."** → pilih **"Project"**
2. Di halaman "Import Git Repository", cari repo **`tmdashnail`**
3. Jika repo tidak muncul, klik **"Adjust GitHub App Permissions"** → centang repo `tmdashnail` → Save
4. Klik **"Import"** di samping repo `tmdashnail`

**Langkah 3 — Konfigurasi Project**
1. **Project Name:** biarkan default atau ubah jadi `tmdash-nail` (ini jadi subdomain: `tmdash-nail.vercel.app`)
2. **Framework Preset:** pastikan terdeteksi **Next.js** (biasanya otomatis)
3. **Root Directory:** klik **"Edit"** → ketik **`nextjs-app`** → klik **"Continue"**
   ⚠️ INI PENTING! Karena kode Next.js ada di dalam folder `nextjs-app`, bukan di root repo
4. **Build and Output Settings:** biarkan default (tidak perlu diubah)

**Langkah 4 — Environment Variables**
Di bagian **"Environment Variables"**, tambahkan 2 variabel berikut:

| Key | Value | Cara Dapat |
|-----|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (string panjang) | Supabase Dashboard → Settings → API → Project API keys → `anon` `public` |

**Cara mendapatkan nilai-nilai di atas:**
1. Buka https://supabase.com/dashboard
2. Pilih project **`tmdash-nailart`**
3. Klik ⚙️ **Settings** di sidebar kiri (icon gear paling bawah)
4. Klik **API** di submenu
5. Copy **Project URL** → paste sebagai value `NEXT_PUBLIC_SUPABASE_URL`
6. Copy **anon public** key (di bagian "Project API keys") → paste sebagai value `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Langkah 5 — Deploy**
1. Klik tombol **"Deploy"**
2. Tunggu proses build selesai (biasanya 1-2 menit)
3. Jika berhasil, akan muncul preview halaman dan URL seperti `https://tmdash-nail.vercel.app`
4. **Catat URL ini!** Akan dipakai di langkah selanjutnya

---

### BAGIAN 2: Konfigurasi Supabase Auth

Setelah deploy berhasil dan kamu punya URL Vercel (contoh: `https://tmdash-nail.vercel.app`):

**Langkah 1 — Buka Supabase Auth Settings**
1. Buka https://supabase.com/dashboard
2. Pilih project **`tmdash-nailart`**
3. Di sidebar kiri, klik **Authentication** (icon kunci)
4. Klik tab **URL Configuration**

**Langkah 2 — Set Site URL**
1. Di field **Site URL**, masukkan URL Vercel kamu:
   ```
   https://tmdash-nail.vercel.app
   ```
   (ganti `tmdash-nail` dengan nama project Vercel kamu yang sebenarnya)
2. Klik **Save**

**Langkah 3 — Tambah Redirect URLs**
1. Di bagian **Redirect URLs**, klik **"Add URL"**
2. Masukkan:
   ```
   https://tmdash-nail.vercel.app/auth/callback
   ```
   (ganti `tmdash-nail` dengan nama project Vercel kamu yang sebenarnya)
3. Klik **Save**

---

### BAGIAN 3: Test Aplikasi

1. Buka URL Vercel kamu di browser: `https://tmdash-nail.vercel.app`
2. Halaman pertama = **Landing/Promo Page** — pastikan tampil dengan benar
3. Klik **"Login Admin"** atau buka `/login`
4. Login dengan akun admin yang sudah dibuat di Supabase:
   - Email: (email yang kamu daftarkan di Supabase Auth)
   - Password: (password yang kamu set)
5. Setelah login, kamu masuk ke **Dashboard** — cek semua menu:
   - ✅ Dashboard (statistik)
   - ✅ Kasir / POS (tambah layanan ke keranjang, proses pembayaran)
   - ✅ Layanan (tambah/edit/hapus layanan)
   - ✅ Riwayat Transaksi (lihat transaksi + cetak struk)
   - ✅ Booking (lihat & konfirmasi booking dari halaman promo)

---

### TROUBLESHOOTING

**Build gagal di Vercel?**
- Pastikan Root Directory sudah di-set ke `nextjs-app`
- Pastikan Environment Variables sudah ditambahkan dengan benar
- Cek build log untuk error spesifik

**Login gagal / redirect error?**
- Pastikan Site URL dan Redirect URL di Supabase Auth sudah benar
- URL harus PERSIS sama (termasuk https://, tanpa trailing slash)
- Pastikan user sudah dibuat di Supabase Authentication → Users

**Halaman kosong / data tidak muncul?**
- Buka browser DevTools (F12) → tab Console, cek error
- Pastikan API key dan URL Supabase sudah benar di Vercel Environment Variables
- Pastikan tabel sudah dibuat dan RLS policy sudah di-set di Supabase

**Perlu redeploy setelah ubah env vars?**
- Ya! Setelah mengubah environment variables di Vercel, klik **"Redeploy"** di tab Deployments
