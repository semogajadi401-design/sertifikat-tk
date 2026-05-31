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

const FONT = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
const FONT_SIZE = '15px'

const SertifikatPreview = forwardRef<HTMLDivElement, Props>(({ student, settings, backgroundUrl }, ref) => {

  const textStyle = (
    top: number,
    left?: number,
    extra?: React.CSSProperties
  ): React.CSSProperties => ({
    position: 'absolute',
    top: `${top}px`,
    fontFamily: FONT,
    fontSize: FONT_SIZE,
    fontWeight: 'bold',
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    ...(left !== undefined
      ? { left: `${left}px` }
      : { left: 0, width: '100%', textAlign: 'center' }
    ),
    ...extra,
  })

  return (
    <div
      ref={ref}
      id="sertifikat-canvas"
      style={{
        width: '794px',
        height: '1123px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {backgroundUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundUrl}
          alt="bg"
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
          }}
          crossOrigin="anonymous"
        />
      )}

      {/* No. Surat */}
      <div style={textStyle(335, undefined, { fontSize: '14px', letterSpacing: '2px' })}>
        {student.no_surat}
      </div>

      {/* Menerangkan bahwa */}
      <div style={textStyle(385, 252)}>
        {student.nama}
      </div>

      {/* Nama */}
      <div style={textStyle(467, 252)}>
        {student.nama}
      </div>

      {/* NIS */}
      <div style={textStyle(502, 252)}>
        {student.nis}
      </div>

      {/* Tempat / Tanggal Lahir */}
      <div style={textStyle(538, 252)}>
        {student.tempat_lahir}, {formatTanggal(student.tanggal_lahir)}
      </div>

      {/* Jenis Kelamin */}
      <div style={textStyle(573, 252)}>
        {student.jenis_kelamin}
      </div>

      {/* Tanggal TTD */}
      <div style={textStyle(958, undefined, { fontWeight: 'normal', fontSize: '14px' })}>
        {settings.tanggal_ttd}
      </div>

      {/* Mengetahui */}
      <div style={textStyle(982, undefined, { fontWeight: 'normal', fontSize: '14px' })}>
        Mengetahui
      </div>

      {/* Kepala Sekolah */}
      <div style={textStyle(1005, undefined, { fontWeight: 'normal', fontSize: '14px' })}>
        Kepala Sekolah
      </div>

      {/* Nama Kepala Sekolah */}
      <div style={textStyle(1082, undefined, { textDecoration: 'underline', letterSpacing: '0.5px', fontSize: '15px' })}>
        {settings.nama_kepsek}
      </div>
    </div>
  )
})

SertifikatPreview.displayName = 'SertifikatPreview'
export default SertifikatPreview
