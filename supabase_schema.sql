-- Jalankan script ini di Supabase SQL Editor

-- Tabel siswa
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  no_surat text not null,
  nama text not null,
  nis text not null,
  tempat_lahir text not null,
  tanggal_lahir date not null,
  jenis_kelamin text not null check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  created_at timestamptz default now()
);

-- Tabel pengaturan
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  tanggal_ttd text not null default 'Bungin, 20 Juni 2026',
  nama_kepsek text not null default 'NURHASNI, LA SIIDI, S.Pd.I',
  background_url text,
  updated_at timestamptz default now()
);

-- Insert default settings (hanya jika belum ada)
insert into settings (tanggal_ttd, nama_kepsek)
select 'Bungin, 20 Juni 2026', 'NURHASNI, LA SIIDI, S.Pd.I'
where not exists (select 1 from settings);

-- Aktifkan RLS (Row Level Security) - public access karena tidak ada login
alter table students enable row level security;
alter table settings enable row level security;

-- Policy: izinkan semua operasi tanpa autentikasi (public)
create policy "public_all_students" on students for all using (true) with check (true);
create policy "public_all_settings" on settings for all using (true) with check (true);
