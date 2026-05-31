# Sertifikat TKQu Alifatma Bungin

Sistem web untuk membuat dan mencetak Surat Keterangan Tamat Belajar TKQu Alifatma Bungin.

## Fitur
- Input data siswa manual atau import dari Excel
- Preview sertifikat dengan background JPG asli
- Download per siswa (PNG / PDF)
- Download semua siswa sekaligus (ZIP)
- Panel admin untuk ubah tanggal TTD, nama kepala sekolah, dan background

---

## Setup

### 1. Supabase

1. Buka [supabase.com](https://supabase.com) → masuk ke project kamu
2. Buka **SQL Editor** → paste isi file `supabase_schema.sql` → klik **Run**
3. Buka **Storage** → buat bucket baru bernama `sertifikat` → set ke **Public**
4. Catat **Project URL** dan **anon public key** dari **Settings → API**

### 2. Clone & Konfigurasi

```bash
git clone https://github.com/username/sertifikat-tk.git
cd sertifikat-tk
npm install
```

Buat file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx
```

### 3. Jalankan lokal
```bash
npm run dev
```

### 4. Deploy ke Vercel

1. Push ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import repository
3. Tambahkan **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**

---

## Cara Pakai

### Upload Background
1. Buka halaman **Pengaturan**
2. Klik **Upload Background** → pilih file JPG sertifikat (tanpa teks tanggal & nama kepala sekolah)
3. Atur **Tanggal TTD** dan **Nama Kepala Sekolah** → Simpan

### Input Data Siswa
- **Manual**: Halaman Data Siswa → klik Tambah Siswa → isi form
- **Import Excel**: Download Template Excel → isi data → Import Excel

### Format Excel (kolom wajib):
| no_surat | nama | nis | tempat_lahir | tanggal_lahir | jenis_kelamin |
|----------|------|-----|--------------|---------------|---------------|
| 001/TK/2026 | Ahmad Fauzi | 2024001 | Bungin | 2019-05-10 | Laki-laki |

### Cetak Sertifikat
1. Buka halaman **Cetak Sertifikat**
2. Gunakan tombol **‹ ›** atau klik nama siswa untuk navigasi
3. Klik **Unduh PNG** atau **Unduh PDF** untuk per siswa
4. Klik **Semua PNG (ZIP)** atau **Semua PDF (ZIP)** untuk semua siswa sekaligus

---

## Kalibrasi Posisi Teks

Jika posisi teks tidak pas di atas background, edit file:
`src/components/SertifikatPreview.tsx`

Ubah nilai `top` dan `left` pada setiap bagian teks sesuai posisi yang diinginkan.
