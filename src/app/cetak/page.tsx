'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import SertifikatPreview from '@/components/SertifikatPreview'
import { supabase, Student, Settings } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Download, Image, FileText, Package, Loader2 } from 'lucide-react'

export default function CetakPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [settings, setSettings] = useState<Settings>({ tanggal_ttd: '', nama_kepsek: '' })
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: sData } = await supabase.from('students').select('*').order('created_at', { ascending: true })
      const { data: cfg } = await supabase.from('settings').select('*').single()
      setStudents(sData || [])
      if (cfg) {
        setSettings(cfg)
        setBackgroundUrl(cfg.background_url || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const student = students[index]

  async function captureCanvas(): Promise<HTMLCanvasElement> {
    const html2canvas = (await import('html2canvas')).default
    const el = document.getElementById('sertifikat-canvas')!
    return html2canvas(el, { useCORS: true, scale: 2, logging: false })
  }

  async function downloadPNG() {
    if (!student) return
    setDownloading('png')
    const canvas = await captureCanvas()
    const a = document.createElement('a')
    a.download = `sertifikat_${student.nama.replace(/\s+/g, '_')}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
    setDownloading('')
  }

  async function downloadPDF() {
    if (!student) return
    setDownloading('pdf')
    const canvas = await captureCanvas()
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
    pdf.save(`sertifikat_${student.nama.replace(/\s+/g, '_')}.pdf`)
    setDownloading('')
  }

  async function downloadAllZip(format: 'png' | 'pdf') {
    if (students.length === 0) return
    setDownloading('zip-' + format)
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const html2canvas = (await import('html2canvas')).default

    for (let i = 0; i < students.length; i++) {
      setIndex(i)
      await new Promise(r => setTimeout(r, 600))
      const el = document.getElementById('sertifikat-canvas')!
      const canvas = await html2canvas(el, { useCORS: true, scale: 2, logging: false })
      const s = students[i]
      const fname = `sertifikat_${s.nama.replace(/\s+/g, '_')}`

      if (format === 'png') {
        const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'))
        zip.file(`${fname}.png`, blob)
      } else {
        const { jsPDF } = await import('jspdf')
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
        zip.file(`${fname}.pdf`, pdf.output('blob'))
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `semua_sertifikat_${format}.zip`
    a.click()
    setDownloading('')
  }

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Memuat data...
      </div>
    </div>
  )

  if (students.length === 0) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <p className="font-semibold">Belum ada data siswa.</p>
        <p className="text-sm">Tambah data siswa di halaman Data Siswa terlebih dahulu.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cetak Sertifikat</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Siswa {index + 1} dari {students.length}: <span className="font-semibold text-gray-700">{student?.nama}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button onClick={downloadPNG} disabled={!!downloading} className="btn-secondary">
              {downloading === 'png' ? <Loader2 size={15} className="animate-spin" /> : <Image size={15} />}
              Unduh PNG
            </button>
            <button onClick={downloadPDF} disabled={!!downloading} className="btn-primary">
              {downloading === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
              Unduh PDF
            </button>
            <button onClick={() => downloadAllZip('png')} disabled={!!downloading} className="btn-secondary">
              {downloading === 'zip-png' ? <Loader2 size={15} className="animate-spin" /> : <Package size={15} />}
              Semua PNG (ZIP)
            </button>
            <button onClick={() => downloadAllZip('pdf')} disabled={!!downloading} className="btn-teal">
              {downloading === 'zip-pdf' ? <Loader2 size={15} className="animate-spin" /> : <Package size={15} />}
              Semua PDF (ZIP)
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Navigasi kiri */}
          <div className="flex flex-col items-center justify-center gap-2 w-10">
            <button
              onClick={() => setIndex(i => Math.max(0, i - 1))}
              disabled={index === 0}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-red-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Preview sertifikat */}
          <div className="flex-1 flex flex-col items-center">
            <div className="shadow-2xl rounded-lg overflow-hidden" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              {student && (
                <SertifikatPreview
                  ref={previewRef}
                  student={student}
                  settings={settings}
                  backgroundUrl={backgroundUrl}
                />
              )}
            </div>
          </div>

          {/* Navigasi kanan */}
          <div className="flex flex-col items-center justify-center gap-2 w-10">
            <button
              onClick={() => setIndex(i => Math.min(students.length - 1, i + 1))}
              disabled={index === students.length - 1}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-red-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Daftar nama siswa (navigasi cepat) */}
        <div className="mt-6 card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigasi Cepat</p>
          <div className="flex flex-wrap gap-2">
            {students.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                  i === index ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {s.nama}
              </button>
            ))}
          </div>
        </div>

        {downloading.startsWith('zip') && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-red-500" />
              <p className="font-semibold text-gray-700">Membuat ZIP semua sertifikat...</p>
              <p className="text-sm text-gray-400">Sedang memproses siswa {index + 1} dari {students.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
