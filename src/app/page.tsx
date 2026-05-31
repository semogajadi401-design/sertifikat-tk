'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { supabase, Student } from '@/lib/supabase'
import { Plus, Upload, Trash2, FileSpreadsheet, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import * as XLSX from 'xlsx'

const emptyForm: Omit<Student, 'id' | 'created_at'> = {
  no_surat: '', nama: '', nis: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki'
}

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const PER_PAGE = 10

  useEffect(() => { fetchStudents() }, [search, page])

  async function fetchStudents() {
    setLoading(true)
    let query = supabase.from('students').select('*', { count: 'exact' })
    if (search) query = query.ilike('nama', `%${search}%`)
    query = query.order('created_at', { ascending: false })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    const { data, count } = await query
    setStudents(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    if (editId) {
      await supabase.from('students').update(form).eq('id', editId)
    } else {
      await supabase.from('students').insert(form)
    }
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    await fetchStudents()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data siswa ini?')) return
    await supabase.from('students').delete().eq('id', id)
    fetchStudents()
  }

  function handleEdit(s: Student) {
    setForm({ no_surat: s.no_surat, nama: s.nama, nis: s.nis, tempat_lahir: s.tempat_lahir, tanggal_lahir: s.tanggal_lahir, jenis_kelamin: s.jenis_kelamin })
    setEditId(s.id!)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus('Membaca file...')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws)
      const mapped: Omit<Student, 'id' | 'created_at'>[] = rows.map(r => ({
        no_surat: String(r['no_surat'] || r['No Surat'] || ''),
        nama: String(r['nama'] || r['Nama'] || ''),
        nis: String(r['nis'] || r['NIS'] || ''),
        tempat_lahir: String(r['tempat_lahir'] || r['Tempat Lahir'] || ''),
        tanggal_lahir: String(r['tanggal_lahir'] || r['Tanggal Lahir'] || ''),
        jenis_kelamin: (r['jenis_kelamin'] || r['Jenis Kelamin'] || 'Laki-laki') as 'Laki-laki' | 'Perempuan',
      })).filter(r => r.nama)
      if (mapped.length === 0) { setImportStatus('Tidak ada data valid ditemukan.'); return }
      setImportStatus(`Mengimpor ${mapped.length} siswa...`)
      const { error } = await supabase.from('students').insert(mapped)
      if (error) { setImportStatus('Gagal import: ' + error.message); return }
      setImportStatus(`✅ Berhasil import ${mapped.length} siswa!`)
      fetchStudents()
      setTimeout(() => setImportStatus(''), 3000)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ['no_surat', 'nama', 'nis', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin'],
      ['001/TK/2026', 'Ahmad Fauzi', '2024001', 'Bungin', '2019-05-10', 'Laki-laki'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Siswa')
    XLSX.writeFile(wb, 'template_siswa.xlsx')
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
            <p className="text-sm text-gray-500 mt-0.5">Total {total} siswa terdaftar</p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadTemplate} className="btn-secondary">
              <FileSpreadsheet size={15} /> Template Excel
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary">
              <Upload size={15} /> Import Excel
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
            <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null) }} className="btn-primary">
              <Plus size={15} /> Tambah Siswa
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="mb-4 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg px-4 py-2 text-sm font-medium">
            {importStatus}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-700 mb-4">{editId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">No. Surat</label>
                <input className="input-field" value={form.no_surat} onChange={e => setForm({ ...form, no_surat: e.target.value })} required placeholder="Contoh: 001/TK/2026" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Lengkap</label>
                <input className="input-field" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required placeholder="Nama lengkap siswa" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">NIS</label>
                <input className="input-field" value={form.nis} onChange={e => setForm({ ...form, nis: e.target.value })} required placeholder="Nomor Induk Siswa" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tempat Lahir</label>
                <input className="input-field" value={form.tempat_lahir} onChange={e => setForm({ ...form, tempat_lahir: e.target.value })} required placeholder="Kota tempat lahir" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tanggal Lahir</label>
                <input className="input-field" type="date" value={form.tanggal_lahir} onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Jenis Kelamin</label>
                <select className="input-field" value={form.jenis_kelamin} onChange={e => setForm({ ...form, jenis_kelamin: e.target.value as any })}>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-2 pt-1">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Menyimpan...' : editId ? 'Update Data' : 'Simpan'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null) }} className="btn-secondary">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-9"
                placeholder="Cari nama siswa..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">No. Surat</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">NIS</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tempat/Tgl Lahir</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">JK</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Memuat data...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Belum ada data siswa</td></tr>
                ) : students.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                    <td className="py-2.5 px-3 text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-600">{s.no_surat}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{s.nama}</td>
                    <td className="py-2.5 px-3 text-gray-600">{s.nis}</td>
                    <td className="py-2.5 px-3 text-gray-600">{s.tempat_lahir}, {new Date(s.tanggal_lahir).toLocaleDateString('id-ID')}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.jenis_kelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {s.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(s)} className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded font-semibold transition-colors">Edit</button>
                        <button onClick={() => handleDelete(s.id!)} className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1 rounded font-semibold transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">Halaman {page} dari {totalPages}</span>
              <div className="flex gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1 px-2 disabled:opacity-40">
                  <ChevronLeft size={14} />
                </button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1 px-2 disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
