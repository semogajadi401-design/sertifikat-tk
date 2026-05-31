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

const SertifikatPreview = forwardRef<HTMLDivElement, Props>(({ student, settings, backgroundUrl }, ref) => {

  const t = (
    top: number,
    left?: number,
    extra?: React.CSSProperties
  ): React.CSSProperties => ({
    position: 'absolute',
    top: `${top}px`,
    fontFamily: FONT,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#111',
    whiteSpace: 'nowrap',
    lineHeight: '1',
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
        height: '1122px',
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
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill' }}
          crossOrigin="anonymous"
        />
      )}

      {/* No. Surat — sejajar titik-titik */}
      <div style={t(323, undefined, { fontSize: '13px', fontWeight: 'normal', letterSpacing: '1px' })}>
        {student.no_surat}
      </div>

      {/* Menerangkan bahwa */}
      <div style={t(376, 293)}>
        {student.nama}
      </div>

      {/* Nama */}
      <div style={t(451, 293)}>
        {student.nama}
      </div>

      {/* NIS */}
      <div style={t(485, 293)}>
        {student.nis}
      </div>

      {/* Tempat / Tanggal Lahir */}
      <div style={t(520, 293)}>
        {student.tempat_lahir}, {formatTanggal(student.tanggal_lahir)}
      </div>

      {/* Jenis Kelamin */}
      <div style={t(555, 293)}>
        {student.jenis_kelamin}
      </div>

      {/* Tanggal TTD */}
      <div style={t(933, undefined, { fontWeight: 'normal', fontSize: '13px' })}>
        {settings.tanggal_ttd}
      </div>

      {/* Mengetahui */}
      <div style={t(959, undefined, { fontWeight: 'normal', fontSize: '13px' })}>
        Mengetahui
      </div>

      {/* Kepala Sekolah */}
      <div style={t(985, undefined, { fontWeight: 'normal', fontSize: '13px' })}>
        Kepala Sekolah
      </div>

      {/* Nama Kepala Sekolah */}
      <div style={t(1068, undefined, { textDecoration: 'underline', fontSize: '14px' })}>
        {settings.nama_kepsek}
      </div>
    </div>
  )
})

SertifikatPreview.displayName = 'SertifikatPreview'
export default SertifikatPreview
