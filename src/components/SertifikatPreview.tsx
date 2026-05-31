'use client'
import { Student, Settings } from '@/lib/supabase'
import { forwardRef } from 'react'

function formatTanggal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
}

interface Props {
  student: Student
  settings: Settings
  backgroundUrl: string
}

const SertifikatPreview = forwardRef<HTMLDivElement, Props>(({ student, settings, backgroundUrl }, ref) => {
  return (
    <div
      ref={ref}
      id="sertifikat-canvas"
      style={{
        width: '794px',
        height: '1123px',
        position: 'relative',
        fontFamily: 'Times New Roman, serif',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {/* Background Image */}
      {backgroundUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundUrl}
          alt="background"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          crossOrigin="anonymous"
        />
      )}

      {/* Overlay content */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {/* No. Surat */}
        <div style={{ position: 'absolute', top: '325px', left: '0', width: '100%', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>
          {student.no_surat}
        </div>

        {/* Nama */}
        <div style={{ position: 'absolute', top: '452px', left: '320px', fontSize: '15px', fontWeight: 'bold' }}>
          {student.nama}
        </div>

        {/* NIS */}
        <div style={{ position: 'absolute', top: '480px', left: '320px', fontSize: '15px', fontWeight: 'bold' }}>
          {student.nis}
        </div>

        {/* Tempat/Tanggal Lahir */}
        <div style={{ position: 'absolute', top: '508px', left: '320px', fontSize: '15px', fontWeight: 'bold' }}>
          {student.tempat_lahir}, {formatTanggal(student.tanggal_lahir)}
        </div>

        {/* Jenis Kelamin */}
        <div style={{ position: 'absolute', top: '536px', left: '320px', fontSize: '15px', fontWeight: 'bold' }}>
          {student.jenis_kelamin}
        </div>

        {/* Tanggal TTD */}
        <div style={{ position: 'absolute', top: '870px', left: '0', width: '100%', textAlign: 'center', fontSize: '14px' }}>
          {settings.tanggal_ttd}
        </div>

        {/* Mengetahui + Kepala Sekolah */}
        <div style={{ position: 'absolute', top: '890px', left: '0', width: '100%', textAlign: 'center', fontSize: '14px', lineHeight: '1.6' }}>
          Mengetahui<br />Kepala Sekolah
        </div>

        {/* Nama Kepsek */}
        <div style={{ position: 'absolute', top: '980px', left: '0', width: '100%', textAlign: 'center', fontSize: '15px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '0.5px' }}>
          {settings.nama_kepsek}
        </div>
      </div>
    </div>
  )
})

SertifikatPreview.displayName = 'SertifikatPreview'
export default SertifikatPreview
