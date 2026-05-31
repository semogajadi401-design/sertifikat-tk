'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import SertifikatPreview from '@/components/SertifikatPreview'
import { supabase, Student, Settings } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Image, FileText, Package, Loader2 } from 'lucide-react'

// Ukuran canvas sertifikat (A4 screen)
const CANVAS_W = 794

export default function CetakPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [settings, setSettings] = useState<Settings>({ tanggal_ttd: '', nama_kepsek: '' })
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [index, setIndex] = useState(0)
  const [offscreenStudent, setOffscreenStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState('')
  const [previewScale, setPreviewScale] = useState(0.85)
  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Hitung scale dinamis berdasarkan lebar container
  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return
      const containerW = containerRef.current.offsetWidth
      // Di mobile tidak pakai tombol navigasi samping, di desktop kurangi untuk tombol
      const isMobile = window.innerWidth < 640
      const availableW = isMobile ? containerW : containerW - 120
      const scale = Math.min(availableW / CANVAS_W, 0.95)
      setPreviewScale(scale)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [loading])

  const student = students[index]

  async function renderAndCapture(s: Student): Promise<HTMLCanvasElement> {
    const html2canvas = (await import('html2canvas')).default
    const offscreenEl = document.getElementById('sertifikat-offscreen')!
    const imgs = offscreenEl.querySelectorAll('img')
    await Promise.all(
      Array.from(imgs).map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(resolve => {
              img.onload = () => resolve()
              img.onerror = () => resolve()
            })
      )
    )
    return html2canvas(offscreenEl, { useCORS: true, scale: 2, logging: false, scrollX: 0, scrollY: 0 })
  }

  async function downloadPNG() {
    if (!student) return
    setDownloading('png')
    setOffscreenStudent(student)
    await new Promise(r => setTimeout(r, 800))
    const canvas = await renderAndCapture(student)
    const a = document.createElement('a')
    a.download = `sertifikat_${student.nama.replace(/\s+/g, '_')}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
    setOffscreenStudent(null)
    setDownloading('')
  }

  async function downloadPDF() {
    if (!student) return
    setDownloading('pdf')
    setOffscreenStudent(student)
    await new Promise(r => setTimeout(r, 800))
    const canvas = await renderAndCapture(student)
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
    pdf.save(`sertifikat_${student.nama.replace(/\s+/g, '_')}.pdf`)
    setOffscreenStudent(null)
    setDownloading('')
  }

  async function downloadAllZip(format: 'png' | 'pdf') {
    if (students.length === 0) return
    setDownloading('zip-' + format)
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (let i = 0; i < students.length; i++) {
      const s = students[i]
      setIndex(i)
      setOffscreenStudent(s)
      await new Promise(r => setTimeout(r, 800))
      const canvas = await renderAndCapture(s)
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
    setOffscreenStudent(null)
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

      {/* Off-screen container untuk capture — tidak ada transform */}
      {offscreenStudent && (
        <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1, pointerEvents: 'none' }}>
          <SertifikatPreview
            id="sertifikat-offscreen"
            student={offscreenStudent}
            settings={settings}
            backgroundUrl={backgroundUrl}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cetak Sertifikat</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Siswa {index + 1} dari {students.length}:{' '}
            <span className="font-semibold text-gray-700">{student?.nama}</span>
          </p>
        </div>

        {/* Tombol download — 2 kolom di mobile, wrap di desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4 sm:mb-6">
          <button onClick={downloadPNG} disabled={!!downloading} className="btn-secondary justify-center">
            {downloading === 'png' ? <Loader2 size={15} className="animate-spin" /> : <Image size={15} />}
            <span>Unduh PNG</span>
          </button>
          <button onClick={downloadPDF} disabled={!!downloading} className="btn-primary justify-center">
            {downloading === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
            <span>Unduh PDF</span>
          </button>
          <button onClick={() => downloadAllZip('png')} disabled={!!downloading} className="btn-secondary justify-center">
            {downloading === 'zip-png' ? <Loader2 size={15} className="animate-spin" /> : <Package size={15} />}
            <span className="truncate">Semua PNG</span>
          </button>
          <button onClick={() => downloadAllZip('pdf')} disabled={!!downloading} className="btn-teal justify-center">
            {downloading === 'zip-pdf' ? <Loader2 size={15} className="animate-spin" /> : <Package size={15} />}
            <span className="truncate">Semua PDF</span>
          </button>
        </div>

        {/* Preview + navigasi */}
        <div ref={containerRef}>
          {/* Navigasi atas (mobile & desktop) */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setIndex(i => Math.max(0, i - 1))}
              disabled={index === 0}
              className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-red-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="text-xs text-gray-500 font-medium">{index + 1} / {students.length}</span>
            <button
              onClick={() => setIndex(i => Math.min(students.length - 1, i + 1))}
              disabled={index === students.length - 1}
              className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-red-50 disabled:opacity-30 transition-all"
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>

          {/* Preview sertifikat — zoom mengecilkan elemen sekaligus tingginya */}
          <div className="flex justify-center">
            <div
              className="shadow-2xl rounded-lg overflow-hidden origin-top"
              style={{
                width: `${CANVAS_W * previewScale}px`,
                zoom: previewScale,
              }}
            >
              {student && (
                <SertifikatPreview
                  ref={previewRef}
                  id="sertifikat-canvas"
                  student={student}
                  settings={settings}
                  backgroundUrl={backgroundUrl}
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigasi cepat */}
        <div className="mt-4 sm:mt-6 card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigasi Cepat</p>
          <div className="flex flex-wrap gap-2">
            {students.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                  i === index
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {s.nama}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay ZIP */}
        {downloading.startsWith('zip') && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center gap-3 w-full max-w-sm">
              <Loader2 size={32} className="animate-spin text-red-500" />
              <p className="font-semibold text-gray-700 text-center">Membuat ZIP semua sertifikat...</p>
              <p className="text-sm text-gray-400 text-center">
                Sedang memproses siswa {index + 1} dari {students.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
