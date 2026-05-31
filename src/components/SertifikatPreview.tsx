'use client'
import { Student, Settings } from '@/lib/supabase'
import { forwardRef } from 'react'

function formatTanggal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const bulan = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ]
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
}

interface Props {
  student: Student
  settings: Settings
  backgroundUrl: string
  id?: string
}

const FONT = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"

const SertifikatPreview = forwardRef<HTMLDivElement, Props>(
  ({ student, settings, backgroundUrl, id = 'sertifikat-canvas' }, ref) => {

    const pos = (top: number, left: number, extra?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      fontFamily: FONT,
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#111',
      whiteSpace: 'nowrap',
      lineHeight: '1',
      ...extra,
    })

    const center = (top: number, extra?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      top: `${top}px`,
      left: 0,
      width: '100%',
      textAlign: 'center',
      fontFamily: FONT,
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#111',
      whiteSpace: 'nowrap',
      lineHeight: '1',
      ...extra,
    })

    // X setelah titik dua (:) — dari deteksi pixel: canvas_x ≈ 305px
    const X = 305

    // Y koordinat masing-masing baris
    const Y_NO   = 400   // sejajar baris "No. : ........"
    const Y_NAMA = 517   // baris "Nama"  (tengah antara 510 dan 524)
    const Y_NIS  = 547   // baris "NIS"
    const Y_TTL  = 577   // baris "Tempat/Tanggal Lahir"
    const Y_JK   = 607   // baris "Jenis Kelamin"

    // Area TTD
    const Y_TGL  = 933
    const Y_MEN  = 959
    const Y_KEP  = 985
    const Y_NKEP = 1050

    return (
      <div
        ref={ref}
        id={id}
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
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'fill',
            }}
            crossOrigin="anonymous"
          />
        )}

        {/* No. Surat — sejajar baris titik-titik */}
        <div style={center(Y_NO, { fontSize: '13px', fontWeight: 'normal' })}>
          {student.no_surat}
        </div>

        {/* Nama */}
        <div style={pos(Y_NAMA, X)}>
          {student.nama}
        </div>

        {/* NIS */}
        <div style={pos(Y_NIS, X)}>
          {student.nis}
        </div>

        {/* Tempat / Tanggal Lahir */}
        <div style={pos(Y_TTL, X)}>
          {student.tempat_lahir}, {formatTanggal(student.tanggal_lahir)}
        </div>

        {/* Jenis Kelamin */}
        <div style={pos(Y_JK, X)}>
          {student.jenis_kelamin}
        </div>

        {/* ── Area TTD ── */}
        <div style={center(Y_TGL, { fontWeight: 'normal', fontSize: '13px' })}>
          {settings.tanggal_ttd}
        </div>
        <div style={center(Y_MEN, { fontWeight: 'normal', fontSize: '13px' })}>
          Mengetahui
        </div>
        <div style={center(Y_KEP, { fontWeight: 'normal', fontSize: '13px' })}>
          Kepala Sekolah
        </div>
        <div style={center(Y_NKEP, { fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: '14px' })}>
          {settings.nama_kepsek}
        </div>
      </div>
    )
  }
)

SertifikatPreview.displayName = 'SertifikatPreview'
export default SertifikatPreview
