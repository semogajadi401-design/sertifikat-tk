'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { supabase, Settings } from '@/lib/supabase'
import { Save, Upload, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react'

export default function AdminPage() {
  const [settings, setSettings] = useState<Settings>({ tanggal_ttd: '', nama_kepsek: '', background_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('settings').select('*').single()
      if (data) setSettings(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: existing } = await supabase.from('settings').select('id').single()
    const existingData = existing as { id: string } | null
    if (existingData?.id) {
      await supabase.from('settings').update({ tanggal_ttd: settings.tanggal_ttd, nama_kepsek: settings.nama_kepsek }).eq('id', existingData.id)
    } else {
      await supabase.from('settings').insert({ tanggal_ttd: settings.tanggal_ttd, nama_kepsek: settings.nama_kepsek })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleUploadBg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadLoading(true)
    setUploadMsg('Mengupload...')

    const filename = `background_${Date.now()}.jpg`
    const { error } = await supabase.storage.from('sertifikat').upload(filename, file, { upsert: true })
    if (error) { setUploadMsg('Gagal upload: ' + error.message); setUploadLoading(false); return }

    const { data: urlData } = supabase.storage.from('sertifikat').getPublicUrl(filename)
    const url = urlData.publicUrl

    const { data: existing } = await supabase.from('settings').select('id').single()
    const existingData = existing as { id: string } | null
    if (existingData?.id) {
      await supabase.from('settings').update({ background_url: url }).eq('id', existingData.id)
    } else {
      await supabase.from('settings').insert({ background_url: url, tanggal_ttd: settings.tanggal_ttd, nama_kepsek: settings.nama_kepsek })
    }

    setSettings(s => ({ ...s, background_url: url }))
    setUploadMsg('✅ Background berhasil diupload!')
    setUploadLoading(false)
    setTimeout(() => setUploadMsg(''), 3000)
    e.target.value = ''
  }

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Memuat...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola teks sertifikat dan background</p>
        </div>

        {/* Form pengaturan teks */}
        <div className="card mb-5">
          <h2 className="font-bold text-gray-700 mb-4">Teks Sertifikat</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Tanggal Tanda Tangan</label>
              <input
                className="input-field"
                value={settings.tanggal_ttd}
                onChange={e => setSettings({ ...settings, tanggal_ttd: e.target.value })}
                placeholder="Contoh: Bungin, 20 Juni 2026"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Tulis persis seperti yang ingin tampil di sertifikat</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Kepala Sekolah</label>
              <input
                className="input-field"
                value={settings.nama_kepsek}
                onChange={e => setSettings({ ...settings, nama_kepsek: e.target.value })}
                placeholder="Contoh: NURHASNI, LA SIIDI, S.Pd.I"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>

        {/* Upload background */}
        <div className="card">
          <h2 className="font-bold text-gray-700 mb-4">Background Sertifikat</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload file JPG/PNG desain sertifikat (tanpa teks tanggal & nama kepala sekolah).
            Ukuran ideal: <strong>794 × 1123 px</strong> (A4).
          </p>

          {settings.background_url && (
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 shadow-sm" style={{ maxHeight: '300px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.background_url} alt="Background sertifikat" className="w-full object-contain" />
            </div>
          )}

          {!settings.background_url && (
            <div className="mb-4 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-10 text-gray-300">
              <ImageIcon size={40} />
              <p className="text-sm mt-2">Belum ada background</p>
            </div>
          )}

          {uploadMsg && (
            <div className="mb-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg px-4 py-2 text-sm font-medium">
              {uploadMsg}
            </div>
          )}

          <button onClick={() => fileRef.current?.click()} disabled={uploadLoading} className="btn-secondary">
            {uploadLoading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploadLoading ? 'Mengupload...' : settings.background_url ? 'Ganti Background' : 'Upload Background'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadBg} />
        </div>
      </div>
    </div>
  )
}
